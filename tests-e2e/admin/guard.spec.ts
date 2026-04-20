import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  mockAdminActivities,
  mockAdminUsersList,
  mockMe,
  regularUser,
} from "./admin-helpers";
import { LOCALES, getStrings } from "./admin-strings";

for (const locale of LOCALES) {
  const s = getStrings(locale).admin;

  test.describe(`Admin route guards [${locale}]`, () => {
    test("unauthenticated admin routes redirect to /admin/login", async ({ page }) => {
      await page.goto(`/${locale}/admin/dashboard`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/admin/login`));
    });

    test("non-admin authenticated user is kicked to /dashboard", async ({ page }) => {
      await injectSession(page, regularUser, locale);
      await mockMe(page, regularUser);
      await mockAdminUsersList(page, []);
      await mockAdminActivities(page);

      await page.goto(`/${locale}/admin/dashboard`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/dashboard`));
    });

    test("admin can reach the admin dashboard", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminUsersList(page, [adminUser], 1);
      await mockAdminActivities(page);

      await page.goto(`/${locale}/admin/dashboard`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/admin/dashboard`));
      await expect(page.getByText(s.shell.title).first()).toBeVisible();
      await expect(page.getByRole("heading", { name: s.dashboard.title })).toBeVisible();
    });
  });
}
