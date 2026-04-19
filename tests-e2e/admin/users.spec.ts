import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  mockAdminActivities,
  mockAdminUserDetail,
  mockAdminUsersList,
  mockMe,
  regularUser,
} from "./admin-helpers";

test.describe("Admin users list", () => {
  test("renders users returned by the backend", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [adminUser, regularUser], 2);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/users");
    await expect(page).toHaveURL(/.*\/tr\/admin\/users/);
    await expect(page.getByRole("heading", { name: "Kullanıcılar" })).toBeVisible();
    await expect(page.getByText("admin@test.com").first()).toBeVisible();
    await expect(page.getByText("user@test.com").first()).toBeVisible();
  });

  test("empty state appears when the server returns no rows", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [], 0);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/users");
    await expect(page.getByText("Seçili filtrelerle eşleşen kullanıcı yok.").first()).toBeVisible();
  });

  test("row click opens the user detail page", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [regularUser], 1);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/users");
    await page.getByText("user@test.com").first().click();
    await expect(page).toHaveURL(new RegExp(`/tr/admin/users/${regularUser.id}`));
    await expect(page.getByRole("heading", { name: /Usain User/ })).toBeVisible();
  });
});

test.describe("Admin user detail", () => {
  test("shows the form populated with server data", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);

    await page.goto(`/tr/admin/users/${regularUser.id}`);
    await expect(page.locator('input[name="first_name"]')).toHaveValue("Usain");
    await expect(page.locator('input[name="last_name"]')).toHaveValue("User");
    await expect(page.locator('input[name="email"]')).toHaveValue("user@test.com");
  });
});
