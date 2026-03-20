import { test, expect } from "../base-test";

test.describe("Middleware - Locale Redirection", () => {
  test("should redirect root URL to localized default (en)", async ({ page }) => {
    // Initial navigation to root
    await page.goto("/");
    // Should redirect to /en based on default locale
    await expect(page).toHaveURL(/.*\/en/);
  });

  test("should redirect to /tr when NEXT_LOCALE cookie is set to 'tr'", async ({
    context,
    page,
  }) => {
    // Set the locale cookie
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "tr",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/");
    // Should now redirect to /tr
    await expect(page).toHaveURL(/.*\/tr/);
  });

  test("should persist locale after navigation", async ({ page }) => {
    await page.goto("/tr");
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/tr/);
  });
});

test.describe("Middleware - Authentication Guards", () => {
  test("should redirect unauthenticated users from /dashboard to /login", async ({ page }) => {
    // Mock the session check API to return 401
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({ status: 401 });
    });

    await page.goto("/tr/dashboard");

    // Middleware sees no access_token or session, redirects to login
    await expect(page).toHaveURL(/.*\/tr\/login.*/);
  });

  test("should redirect authenticated users from /login to /dashboard", async ({
    context,
    page,
  }) => {
    // Mock the session check API to return 200 (authenticated)
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "1", email: "test@example.com" }),
      });
    });

    // Inject the authentication cookie
    await context.addCookies([
      {
        name: "access_token",
        value: "fake-jwt-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/tr/login");

    // Should be redirected away from login since already authenticated
    await expect(page).toHaveURL(/.*\/tr\/dashboard/);
  });
});

test.describe("Middleware - Authenticated Access", () => {
  test.beforeEach(async ({ context }) => {
    // Inject the authentication cookie
    await context.addCookies([
      {
        name: "access_token",
        value: "fake-jwt-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("should allowing accessing protected /dashboard with valid token", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "1", email: "test@example.com" }),
      });
    });

    await page.goto("/tr/dashboard");
    await expect(page).toHaveURL(/.*\/tr\/dashboard/);
  });

  test("should allowing accessing protected /profile with valid token", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "1", email: "test@example.com" }),
      });
    });

    await page.goto("/en/profile");
    await expect(page).toHaveURL(/.*\/en\/profile/);
  });
});
