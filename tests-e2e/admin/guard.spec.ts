import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  mockAdminActivities,
  mockAdminUsersList,
  mockMe,
  regularUser,
} from "./admin-helpers";

test.describe("Admin route guards", () => {
  test("unauthenticated admin routes redirect to /admin/login", async ({ page }) => {
    await page.goto("/tr/admin/dashboard");
    await expect(page).toHaveURL(/.*\/tr\/admin\/login/);
  });

  test("non-admin authenticated user is kicked to /dashboard", async ({ page }) => {
    await injectSession(page, regularUser);
    await mockMe(page, regularUser);
    await mockAdminUsersList(page, []);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/dashboard");
    await expect(page).toHaveURL(/.*\/tr\/dashboard/);
  });

  test("admin can reach the admin dashboard", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [adminUser], 1);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/dashboard");
    await expect(page).toHaveURL(/.*\/tr\/admin\/dashboard/);
    // Sidebar nav is rendered with admin title
    await expect(page.getByText("Yönetim").first()).toBeVisible();
    // Page heading
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  });
});
