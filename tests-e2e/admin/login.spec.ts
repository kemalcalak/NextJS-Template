import { test, expect } from "../base-test";
import {
  adminUser,
  mockAdminActivities,
  mockAdminUsersList,
  mockMe,
  regularUser,
} from "./admin-helpers";

test.describe("Admin login", () => {
  test("admin credentials land on /admin/dashboard", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "access_token=fake-admin-token; Path=/; HttpOnly; SameSite=Lax",
        },
        body: JSON.stringify({
          token_type: "bearer",
          user: adminUser,
          message: "success.auth.login",
        }),
      });
    });
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [adminUser], 1);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/login");
    // pressSequentially fires per-character keydown/keypress/keyup events so
    // react-hook-form's controlled inputs register the value on webkit. Bare
    // page.fill() occasionally drops the email field on webkit here.
    await page.locator('input[name="email"]').pressSequentially(adminUser.email);
    await page.locator('input[name="password"]').pressSequentially("Password123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/tr\/admin\/dashboard/);
  });

  test("non-admin credentials from admin login land on regular dashboard", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "access_token=fake-user-token; Path=/; HttpOnly; SameSite=Lax",
        },
        body: JSON.stringify({
          token_type: "bearer",
          user: regularUser,
          message: "success.auth.login",
        }),
      });
    });
    await mockMe(page, regularUser);

    await page.goto("/tr/admin/login");
    await page.locator('input[name="email"]').pressSequentially(regularUser.email);
    await page.locator('input[name="password"]').pressSequentially("Password123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/tr\/dashboard/);
  });

  test("invalid credentials keep the user on /admin/login", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Invalid credentials" }),
      });
    });

    await page.goto("/tr/admin/login");
    await page.fill('input[name="email"]', "wrong@admin.test");
    await page.fill('input[name="password"]', "nope");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/tr\/admin\/login/);
  });

  test("empty fields raise validation errors", async ({ page }) => {
    await page.goto("/tr/admin/login");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Email gereklidir").or(page.locator("text=Email is required")).first(),
    ).toBeVisible();
    await expect(
      page.locator("text=Şifre gereklidir").or(page.locator("text=Password is required")).first(),
    ).toBeVisible();
  });

  test("back-to-app link returns to the marketing home", async ({ page }) => {
    await page.goto("/tr/admin/login");
    await page.getByRole("link", { name: /Ana uygulamaya dön|Back to the main app/ }).click();
    await expect(page).toHaveURL(/.*\/tr\/?$/);
  });
});
