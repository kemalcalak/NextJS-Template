import { test, expect } from "../base-test";

import type { Page } from "@playwright/test";

const setupAuthenticatedState = async (page: Page) => {
  const mockUser = {
    id: "1",
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

test.describe("Header - Mobile Viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    // Mock unauthenticated state by default
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({ status: 401 });
    });
  });

  test("should show the hamburger menu button and open drawer", async ({ page }) => {
    await page.goto("/tr");
    const hamburgerBtn = page
      .getByRole("button", { name: /Menüyü Aç\/Kapat|toggle menu/i })
      .first();
    await expect(hamburgerBtn).toBeVisible();

    await hamburgerBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test("should show Login and Register buttons in drawer when unauthenticated (TR)", async ({
    page,
  }) => {
    await page.goto("/tr");
    await page
      .getByRole("button", { name: /Menüyü Aç\/Kapat|toggle menu/i })
      .first()
      .click();

    // Labels from auth.json
    await expect(page.getByRole("button", { name: /Giriş Yap/i }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Kayıt Ol|Register|Create Account/i }).first(),
    ).toBeVisible();
  });

  test("should show user info in drawer when authenticated", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr");
    await page
      .getByRole("button", { name: /Menüyü Aç\/Kapat|toggle menu/i })
      .first()
      .click();

    await expect(page.getByText("John Doe").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Çıkış Yap|Logout/i }).first()).toBeVisible();
  });

  test("should switch language between TR and EN", async ({ page }) => {
    // Start from home page which will redirect to default locale (/en)
    await page.goto("/");
    await expect(page).toHaveURL(/.*\/en/);

    // Open menu
    await page
      .getByRole("button", { name: /Menüyü Aç\/Kapat|toggle menu/i })
      .first()
      .click();

    // Select the language toggle button. It might be labeled as "Dil" or "Language" or "Türkçe"
    const targetLangBtn = page
      .getByRole("button", { name: /Dili Değiştir|Toggle Language|Dil|Language|Türkçe/i })
      .first();
    await expect(targetLangBtn).toBeVisible();

    // Force click to handle any viewport or animation issues
    await targetLangBtn.scrollIntoViewIfNeeded();
    await targetLangBtn.click({ force: true });

    // Should switch to TR and close drawer
    await expect(page).toHaveURL(/.*\/tr/, { timeout: 15000 });
  });
});

test.describe("Header - Desktop Viewport", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({ status: 401 });
    });
  });

  test("should show Login and Register buttons when unauthenticated (EN)", async ({ page }) => {
    await page.goto("/en");
    // Flexible names for Login/Register
    await expect(page.getByRole("button", { name: /Login|Giriş Yap/i }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Register|Kayıt Ol|Sign Up|Create Account/i }).first(),
    ).toBeVisible();
  });

  test("should show user avatar and dropdown when authenticated", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr");

    // Login/Register should be hidden
    await expect(page.getByRole("button", { name: /Giriş Yap|Login/i })).not.toBeVisible();

    // Avatar button
    const avatarBtn = page.locator("button.rounded-full").first();
    await expect(avatarBtn).toBeVisible();

    await avatarBtn.click();
    await expect(page.getByText("John Doe").first()).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Profil/i }).first()).toBeVisible();
  });

  test("should toggle theme via header", async ({ page }) => {
    await page.goto("/tr");
    const themeBtn = page.getByRole("button", { name: /Temayı Değiştir|Toggle theme/i }).first();
    await expect(themeBtn).toBeVisible();

    await themeBtn.click();

    // The theme is persisted in localStorage 'theme' key
    const getTheme = () => page.evaluate(() => localStorage.getItem("theme"));
    await expect.poll(getTheme, { timeout: 3000 }).not.toBeNull();
  });
});
