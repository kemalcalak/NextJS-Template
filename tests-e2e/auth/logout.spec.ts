import { type Page } from "@playwright/test";

import { test, expect } from "../base-test";

// Helper to inject authenticated state into both the API and cookies
const setupAuthenticatedState = async (page: Page) => {
  const mockUser = {
    id: "user-123",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
  };

  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockUser),
    });
  });

  // Inject token cookie and store state
  // Using domain/path consistent with other tests
  await page.context().addCookies([
    {
      name: "access_token",
      value: "fake-jwt",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  // Set locale storage manually after navigation to avoid persistent init script issues
  await page.evaluate(
    (storageData) => {
      window.localStorage.setItem("auth-storage", storageData);
    },
    JSON.stringify({ state: { user: mockUser, isAuthenticated: true }, version: 0 }),
  );
};

test.describe("Logout Flow", () => {
  test("should successfully logout from desktop dropdown", async ({ page }) => {
    // Mock the logout API
    await page.route("**/api/v1/auth/logout", async (route) => {
      // Clear cookie to stop middleware from redirecting back to dashboard
      await page.context().clearCookies({ name: "access_token" });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Logged out successfully" }),
      });
    });

    await page.goto("/tr/dashboard");
    await setupAuthenticatedState(page);
    await page.reload(); // Apply state and trigger me route mock

    // Click on profile avatar/dropdown
    // The button has an img with email as alt, and fallback text is first letter of name (J for John)
    const avatar = page
      .getByRole("button", { name: "john@example.com" })
      .or(page.locator('button:has-text("J")'))
      .first();
    await avatar.click();

    // Click on Logout button
    await page.click("text=Çıkış Yap");

    // Should redirect to login or home
    await expect(page).toHaveURL(/.*\/tr(\/login)?$/);

    // After logout, verify we can't get back (mock me to return 401 first)
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ detail: "Not authenticated" }) });
    });
    // This may be interrupted by the app's own redirect logic, which is fine
    await page.goto("/tr/dashboard").catch(() => {
      // Ignore navigation error
    });
    await expect(page).toHaveURL(/.*\/tr\/login/);
  });

  test("should successfully logout from mobile drawer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Mock the logout API
    await page.route("**/api/v1/auth/logout", async (route) => {
      // Clear cookie to stop middleware from redirecting back to dashboard
      await page.context().clearCookies({ name: "access_token" });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Logged out successfully" }),
      });
    });

    await page.goto("/tr/dashboard");
    await setupAuthenticatedState(page);
    await page.reload();

    // Open mobile menu
    // The button has a screen reader span with "Menü" text
    await page.getByRole("button", { name: /Menü/i }).click();

    // Click on Logout in the drawer
    await page.click("text=Çıkış Yap");

    await expect(page).toHaveURL(/.*\/tr(\/login)?$/);
  });
});
