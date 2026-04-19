import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  mockAdminActivities,
  mockAdminUsersList,
  mockMe,
  regularUser,
} from "./admin-helpers";

import type { Page } from "@playwright/test";

// Returns distinct `total` values depending on which filter was requested, so
// each of the 4 stat cards can be asserted independently.
const mockUserStats = async (
  page: Page,
  { total, active, admins }: { total: number; active: number; admins: number },
): Promise<void> => {
  await page.route(/.*\/api\/v1\/admin\/users(\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const url = new URL(route.request().url());
    let value = total;
    if (url.searchParams.get("is_active") === "true") value = active;
    else if (url.searchParams.get("role") === "admin") value = admins;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], total: value, skip: 0, limit: 1 }),
    });
  });
};

test.describe("Admin dashboard", () => {
  test("renders stat cards with totals from the backend", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockUserStats(page, { total: 42, active: 37, admins: 3 });
    await mockAdminActivities(page);

    await page.goto("/tr/admin/dashboard");

    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(page.getByText("42", { exact: true })).toBeVisible();
    await expect(page.getByText("37", { exact: true })).toBeVisible();
    // Two stat cards share a total; the third "3" is the admins count.
    await expect(page.getByText("3", { exact: true })).toBeVisible();
  });

  test("quick-action buttons navigate to users and activities", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUsersList(page, [adminUser, regularUser], 2);
    await mockAdminActivities(page);

    await page.goto("/tr/admin/dashboard");

    await page.getByRole("link", { name: "Tüm kullanıcıları gör" }).click();
    await expect(page).toHaveURL(/.*\/tr\/admin\/users/);

    await page.goto("/tr/admin/dashboard");
    await page.getByRole("link", { name: "Tüm aktiviteleri gör" }).click();
    await expect(page).toHaveURL(/.*\/tr\/admin\/activities/);
  });
});
