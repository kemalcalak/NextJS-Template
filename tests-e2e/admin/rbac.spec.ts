import { Permission } from "@/lib/types/permissions";

import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  makeAdmin,
  mockAdminActivities,
  mockAdminsList,
  mockAdminStats,
  mockAdminUsersList,
  mockMe,
  mockPermissionCatalog,
  nonRootSuperadminUser,
  regularUser,
  superadminUser,
} from "./admin-helpers";
import { LOCALES, getStrings } from "./admin-strings";

for (const locale of LOCALES) {
  const s = getStrings(locale).admin;

  test.describe(`Admin RBAC [${locale}]`, () => {
    test("nav shows only the sections the admin has read access to", async ({ page }) => {
      const limited = makeAdmin([Permission.UsersRead, Permission.StatsRead]);
      await injectSession(page, limited, locale);
      await mockMe(page, limited);
      await mockAdminStats(page);
      await mockAdminUsersList(page, []);

      await page.goto(`/${locale}/admin/dashboard`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/admin/dashboard`));

      const nav = page.locator("nav").first();
      await expect(nav.getByRole("link", { name: s.shell.nav.users, exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: s.shell.nav.files, exact: true })).toHaveCount(0);
      await expect(
        nav.getByRole("link", { name: s.shell.nav.activities, exact: true }),
      ).toHaveCount(0);
      await expect(nav.getByRole("link", { name: s.shell.nav.support, exact: true })).toHaveCount(
        0,
      );
      await expect(nav.getByRole("link", { name: s.shell.nav.admins, exact: true })).toHaveCount(0);
    });

    test("a section the admin lacks read access to renders the forbidden state", async ({
      page,
    }) => {
      const limited = makeAdmin([Permission.UsersRead]);
      await injectSession(page, limited, locale);
      await mockMe(page, limited);

      await page.goto(`/${locale}/admin/files`);
      await expect(page.getByText(s.permissionDenied.title)).toBeVisible();
    });

    test("row actions are hidden without the matching permission", async ({ page }) => {
      const readOnly = makeAdmin([Permission.UsersRead]);
      await injectSession(page, readOnly, locale);
      await mockMe(page, readOnly);
      await mockAdminUsersList(page, [regularUser], 1);

      await page.goto(`/${locale}/admin/users`);
      await expect(page.getByText(regularUser.email)).toBeVisible();
      // No destructive grants → the row "⋯" menu trigger is not rendered.
      await expect(page.getByRole("button", { name: s.users.rowActions.menu })).toHaveCount(0);
    });

    test("row actions appear once the permission is granted", async ({ page }) => {
      const canDelete = makeAdmin([Permission.UsersRead, Permission.UsersDelete]);
      await injectSession(page, canDelete, locale);
      await mockMe(page, canDelete);
      await mockAdminUsersList(page, [regularUser], 1);

      await page.goto(`/${locale}/admin/users`);
      await expect(page.getByRole("button", { name: s.users.rowActions.menu })).toBeVisible();
    });

    test("superadmin sees the Admins section and can manage it", async ({ page }) => {
      await injectSession(page, superadminUser, locale);
      await mockMe(page, superadminUser);
      await mockAdminsList(page);
      await mockPermissionCatalog(page);

      await page.goto(`/${locale}/admin/admins`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/admin/admins`));
      await expect(page.getByRole("heading", { name: s.admins.title })).toBeVisible();
      await expect(
        page.getByRole("button", { name: s.admins.create.action }).first(),
      ).toBeVisible();
      await expect(page.getByText("limited@test.com")).toBeVisible();

      const nav = page.locator("nav").first();
      await expect(nav.getByRole("link", { name: s.shell.nav.admins, exact: true })).toBeVisible();
    });

    test("the root superadmin sees the superadmin-tier actions", async ({ page }) => {
      await injectSession(page, superadminUser, locale);
      await mockMe(page, superadminUser);
      await mockAdminsList(page);
      await mockPermissionCatalog(page);

      await page.goto(`/${locale}/admin/admins`);
      // Root-only header action + per-row tier actions are all offered.
      await expect(page.getByRole("button", { name: s.admins.transferRoot.action })).toBeVisible();
      await expect(
        page.getByRole("button", { name: s.admins.promoteSuperadmin.action }),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: s.admins.demoteToAdmin.action })).toBeVisible();
      await expect(
        page.getByRole("button", { name: s.admins.delete.action }).first(),
      ).toBeVisible();
    });

    test("a non-root superadmin does not see the root-only actions", async ({ page }) => {
      await injectSession(page, nonRootSuperadminUser, locale);
      await mockMe(page, nonRootSuperadminUser);
      await mockAdminsList(page);
      await mockPermissionCatalog(page);

      await page.goto(`/${locale}/admin/admins`);
      // Still manages admins (create), but the root-only tier actions are gone.
      await expect(
        page.getByRole("button", { name: s.admins.create.action }).first(),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: s.admins.transferRoot.action })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: s.admins.promoteSuperadmin.action }),
      ).toHaveCount(0);
      await expect(page.getByRole("button", { name: s.admins.demoteToAdmin.action })).toHaveCount(
        0,
      );
    });

    test("the create-admin modal opens with the account fields", async ({ page }) => {
      await injectSession(page, superadminUser, locale);
      await mockMe(page, superadminUser);
      await mockAdminsList(page);
      await mockPermissionCatalog(page);

      await page.goto(`/${locale}/admin/admins`);
      await page.getByRole("button", { name: s.admins.create.action }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(s.admins.create.emailLabel, { exact: true })).toBeVisible();
      await expect(page.getByText(s.admins.create.passwordLabel, { exact: true })).toBeVisible();
    });

    test("a plain admin cannot open the superadmin-only Admins page", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);

      await page.goto(`/${locale}/admin/admins`);
      await expect(page.getByText(s.permissionDenied.title)).toBeVisible();
    });

    test("an admin visiting a user-area page is redirected into the admin panel", async ({
      page,
    }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminStats(page);
      await mockAdminUsersList(page, [adminUser], 1);
      await mockAdminActivities(page);

      await page.goto(`/${locale}/dashboard`);
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/admin/dashboard`));
    });
  });
}
