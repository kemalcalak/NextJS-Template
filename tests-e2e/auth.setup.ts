import { test as setup, expect } from "@playwright/test";

/**
 * Setup test that authenticates a user once and caches the storage state.
 * Other tests will use this cached state via storageState configuration.
 * This dramatically speeds up test execution since we don't need to login in every test.
 */
setup("authenticate user", async ({ page }) => {
  // Mock the login API response
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "Set-Cookie": "access_token=fake-jwt-token; Path=/; HttpOnly; SameSite=Lax",
      },
      body: JSON.stringify({
        access_token: "fake-jwt-token",
        token_type: "bearer",
        user: {
          id: "1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      }),
    });
  });

  // Mock the me endpoint that fetches current user details
  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "1",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
      }),
    });
  });

  // Navigate to login page
  await page.goto("/tr/login");

  // Fill in login form
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "Password123!");

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard, confirming successful login
  await expect(page).toHaveURL(/.*\/tr\/dashboard/);

  // Save the authentication state (cookies, local storage, session storage)
  // This will be reused by other tests via storageState configuration
  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});
