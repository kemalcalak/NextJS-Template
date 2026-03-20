import { test, expect } from "../base-test";

import type { Page } from "@playwright/test";

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

  // Inject authentication cookie for middleware compatibility
  await page.context().addCookies([
    {
      name: "access_token",
      value: "fake-jwt-token",
      domain: "localhost",
      path: "/",
    },
    {
      name: "NEXT_LOCALE",
      value: "tr",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.addInitScript(
    (storageData) => {
      window.localStorage.setItem("auth-storage", storageData);
    },
    JSON.stringify({
      state: { user: mockUser, isAuthenticated: true },
      version: 0,
    }),
  );
};

test.describe("Dashboard Page", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/dashboard");

    await expect(page).toHaveTitle(/Dashboard/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Kişisel dashboard'unuzdan projelerinizi, görevlerinizi ve ekibinizi yönetin.",
    );
  });

  test("should display welcome message and user info", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/dashboard");

    // Welcome message from dashboard.welcome key
    await expect(page.locator("text=Hoş geldiniz").first()).toBeVisible();

    // User info card content
    await expect(page.locator("text=Kullanıcı Bilgileri").first()).toBeVisible();
    await expect(page.locator("text=John").first()).toBeVisible();
    await expect(page.locator("text=john@example.com").first()).toBeVisible();
  });

  test("should show loading skeletons", async ({ page }) => {
    // Delay API response to ensure skeletons are visible
    await page.route("**/api/v1/users/me", async (route) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "1", first_name: "John" }),
      });
    });

    // We don't call setupAuthenticatedState here to avoid setting cookie before navigation
    // but the middleware might redirect. So we set just the cookie.
    await page.context().addCookies([
      {
        name: "access_token",
        value: "fake-jwt",
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/tr/dashboard");
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
  });

  test("should have functional navigation from dashboard to profile", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/dashboard");

    // Use the header profile button (robust)
    const profileBtn = page
      .getByRole("button", { name: "john@example.com" })
      .or(page.locator('button:has-text("J")'))
      .or(page.getByRole("button", { name: /Menüyü Aç\/Kapat/i }))
      .first();
    await profileBtn.click();

    // Choose "Profil" from the menu that appeared
    await page.getByText("Profil").first().click();
    await expect(page).toHaveURL(/.*\/tr\/profile/);
  });
});
