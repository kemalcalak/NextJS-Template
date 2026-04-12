import { type BrowserContext, type Page } from "@playwright/test";

import { test, expect } from "../base-test";

/**
 * Covers the self-deactivation grace-period flow end-to-end:
 *   1. Authenticated user opens the Danger Zone → submits the dialog → API
 *      clears the session cookie and frontend routes back to /login.
 *   2. User logs back in during the grace window → the login response returns
 *      a `deletion_scheduled_at`, which the auth flow honours by landing them
 *      on /account-deactivated instead of /dashboard.
 *   3. From /account-deactivated, clicking "reactivate" calls the reactivate
 *      endpoint and the user is routed back to the dashboard.
 */

interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  title: string | null;
  deactivated_at: string | null;
  deletion_scheduled_at: string | null;
}

const baseUser: MockUser = {
  id: "user-1",
  email: "jane@example.com",
  first_name: "Jane",
  last_name: "Doe",
  role: "USER",
  is_active: true,
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  title: null,
  deactivated_at: null,
  deletion_scheduled_at: null,
};

/**
 * Seeds an authenticated session BEFORE the first navigation, so the Next.js
 * proxy sees the cookie and does not bounce protected routes to /login. The
 * zustand auth-storage is injected via addInitScript so it is present on the
 * very first render (no flash of unauth'd content).
 */
const seedAuthedSession = async (context: BrowserContext, user: MockUser) => {
  await context.addCookies([
    { name: "access_token", value: "fake-jwt", domain: "127.0.0.1", path: "/" },
  ]);
  await context.addInitScript(
    (storageData: string) => {
      window.localStorage.setItem("auth-storage", storageData);
    },
    JSON.stringify({
      state: { user, isAuthenticated: true, isSessionInitialized: true },
      version: 0,
    }),
  );
};

const stubMe = async (page: Page, getUser: () => MockUser) => {
  await page.route("**/api/v1/users/me", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(getUser()),
    });
  });
};

// Next dev compiles a route on the first request that hits it; give the
// landing navigation enough headroom so the Suspense loading.tsx has time
// to resolve before we start asserting on page content.
test.describe.configure({ timeout: 90_000 });

test.describe("Account deactivation flow", () => {
  test("deactivates from the Danger Zone and redirects to login", async ({ page, context }) => {
    let currentUser: MockUser = { ...baseUser };

    await stubMe(page, () => currentUser);

    await page.route("**/api/v1/users/me", async (route) => {
      if (route.request().method() !== "DELETE") return route.fallback();

      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      currentUser = {
        ...currentUser,
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deletion_scheduled_at: future,
      };
      await context.clearCookies({ name: "access_token" });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "success.account.deactivated",
          deletion_scheduled_at: future,
        }),
      });
    });

    await seedAuthedSession(context, currentUser);
    await page.goto("/tr/profile");

    // Switch to Security tab where the Danger Zone lives. Wait for the tab
    // first: on a cold dev-server hit the route still has to compile past
    // the loading.tsx Suspense fallback.
    const securityTab = page.getByRole("tab", { name: /güvenlik/i });
    await securityTab.waitFor({ state: "visible", timeout: 60_000 });
    await securityTab.click();

    await page.getByRole("button", { name: /hesabı devre dışı bırak/i }).click();

    // Dialog is open — fill password + tick the acknowledgement.
    await page.getByLabel(/onaylamak için şifrenizi girin/i).fill("Password123!");
    await page.getByRole("checkbox").check();

    await page.getByRole("button", { name: /^devre dışı bırak$/i }).click();

    // Frontend clears its auth store and pushes the user to the login page.
    await expect(page).toHaveURL(/.*\/tr\/login/);
  });

  test("re-logging in during grace period lands on /account-deactivated", async ({ page }) => {
    const future = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();
    const deactivatedUser: MockUser = {
      ...baseUser,
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deletion_scheduled_at: future,
    };

    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "access_token=fake-jwt-token; Path=/; HttpOnly; SameSite=Lax",
        },
        body: JSON.stringify({
          token_type: "bearer",
          user: deactivatedUser,
          message: "success.auth.login",
        }),
      });
    });

    // /me returns 401 on the /login page so AuthHydrator treats us as logged
    // out. Only AFTER the login mutation fires does the user become known —
    // at which point useLoginMutation.onSuccess inspects deletion_scheduled_at
    // and routes to /account-deactivated. If we mocked /me as deactivated up
    // front, AuthHydrator would bounce us off /login before we can submit.
    await page.route("**/api/v1/users/me", async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Not authenticated" }),
      });
    });

    await page.goto("/tr/login");
    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: "visible", timeout: 60_000 });
    await emailInput.fill("jane@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/tr\/account-deactivated/);

    // Countdown + scheduled-date copy must be rendered.
    await expect(page.getByText(/kalıcı silinmeye/i)).toBeVisible();
    await expect(page.getByText(/silme tarihi:/i)).toBeVisible();
  });

  test("reactivate from deactivated page routes back to the dashboard", async ({
    page,
    context,
  }) => {
    const future = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
    let currentUser: MockUser = {
      ...baseUser,
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deletion_scheduled_at: future,
    };

    await stubMe(page, () => currentUser);

    await page.route("**/api/v1/users/me/reactivate", async (route) => {
      currentUser = {
        ...currentUser,
        is_active: true,
        deactivated_at: null,
        deletion_scheduled_at: null,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "success.account.reactivated",
        }),
      });
    });

    // Dashboard shell probes users list; keep it happy so the landing page
    // renders without hitting the global 401 interceptor.
    await page.route("**/api/v1/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([currentUser]),
      });
    });

    await seedAuthedSession(context, currentUser);
    await page.goto("/tr/account-deactivated");

    await expect(page).toHaveURL(/.*\/tr\/account-deactivated/);

    const reactivateButton = page.getByRole("button", { name: /hesabımı koru/i });
    await reactivateButton.waitFor({ state: "visible", timeout: 60_000 });
    await reactivateButton.click();

    await expect(page).toHaveURL(/.*\/tr\/dashboard/);
  });
});
