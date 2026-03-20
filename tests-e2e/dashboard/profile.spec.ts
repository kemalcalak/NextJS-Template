import { test, expect } from "../base-test";

import type { Page } from "@playwright/test";

const mockUser = {
  id: "user-123",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
};

// Helper to inject authenticated state into both the API and cookies
const setupAuthenticatedState = async (page: Page) => {
  await page.route(/.*\/api\/v1\/users\/me.*/, async (route) => {
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

test.describe("Profile Page - Shared", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/profile");

    await expect(page).toHaveTitle(/Profil Ayarları/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Kişisel profilinizi, tercihlerinizi ve hesap ayarlarınızı görüntüleyin ve düzenleyin.",
    );
  });

  test("should display profile information correctly", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/profile");

    await expect(page.locator('input[name="first_name"]')).toHaveValue("John");
    await expect(page.locator('input[name="last_name"]')).toHaveValue("Doe");
    await expect(page.locator('input[name="email"]')).toHaveValue("john@example.com");
  });

  test("should toggle edit mode and show save/cancel buttons", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/profile");

    // Initially disabled
    await expect(page.locator('input[name="first_name"]')).toBeDisabled();

    // Click Edit button (t("common:actions.edit"))
    await page.click('button:has-text("Düzenle")');

    await expect(page.locator('input[name="first_name"]')).toBeEnabled();
    await expect(page.locator('button:has-text("Kaydet")')).toBeVisible();
    await expect(page.locator('button:has-text("İptal")')).toBeVisible();
  });

  test("should switch between tabs", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/profile");

    // Switch to Security tab
    await page.getByRole("tab", { name: /Güvenlik/i }).click();

    await expect(page.locator("text=Mevcut Şifre").first()).toBeVisible();
    await expect(page.locator('input[name="current_password"]')).toBeVisible();
  });

  test("should update profile successfully", async ({ page }) => {
    await setupAuthenticatedState(page);

    // Mock dynamic update
    await page.route(/.*\/api\/v1\/users\/me.*/, async (route) => {
      const method = route.request().method();
      if (method === "PATCH" || method === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: { id: "123", email: "john@example.com", first_name: "Johnny" },
            message: "success.user.updated",
          }),
        });
      } else {
        // Fallback to GET response
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockUser),
        });
      }
    });

    await page.goto("/tr/profile");
    await page.click('button:has-text("Düzenle")');
    await page.fill('input[name="first_name"]', "Johnny");
    await page.click('button:has-text("Kaydet")');

    await expect(page.locator("text=başarıyla güncellendi").first()).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toHaveValue("Johnny");
  });

  test("should show validation errors on profile info form", async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto("/tr/profile");

    await page.click('button:has-text("Düzenle")');
    await page.fill('input[name="first_name"]', "a"); // Too short
    await page.click('button:has-text("Kaydet")');

    await expect(
      page.locator("text=en az 2").or(page.locator("text=at least 2")).first(),
    ).toBeVisible();
  });

  test("should successfully change password in security tab", async ({ page }) => {
    await setupAuthenticatedState(page);

    // Mock successful password change response
    await page.route(/.*\/api\/v1\/auth\/change-password.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success.auth.password_change_success" }),
      });
    });

    await page.goto("/tr/profile");
    await page.getByRole("tab", { name: /Güvenlik/i }).click();

    await page.fill('input[name="current_password"]', "OldPass123!");
    await page.fill('input[name="new_password"]', "NewPass123!");
    await page.fill('input[name="confirmPassword"]', "NewPass123!");

    await page.click('button:has-text("Şifreyi Güncelle")');

    await expect(
      page.locator("text=başarıyla").or(page.locator("text=successfully")).first(),
    ).toBeVisible();
  });
});
