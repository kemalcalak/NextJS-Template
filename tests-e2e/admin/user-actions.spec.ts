import { test, expect } from "../base-test";
import {
  adminUser,
  injectSession,
  mockAdminActivities,
  mockAdminUserDetail,
  mockMe,
  regularUser,
} from "./admin-helpers";

import type { Page } from "@playwright/test";

const inactiveUser = { ...regularUser, id: "user-2", email: "pause@test.com", is_active: false };

const mockAdminUserAction = async (
  page: Page,
  urlPattern: RegExp,
  method: string,
  status = 200,
): Promise<{ calls: number }> => {
  const state = { calls: 0 };
  await page.route(urlPattern, async (route) => {
    if (route.request().method() !== method) {
      // fallback() lets a previously registered handler (e.g. mockAdminUserDetail)
      // serve the request. continue() would forward to the real network — the
      // base-test global interceptor doesn't see the fall-through either.
      await route.fallback();
      return;
    }
    state.calls += 1;
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "ok" }),
    });
  });
  return state;
};

test.describe("Admin user actions", () => {
  test("edit form submits PATCH /admin/users/:id with the changed payload", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);

    let capturedBody: string | null = null;
    await page.route(new RegExp(`.*/api/v1/admin/users/${regularUser.id}$`), async (route) => {
      if (route.request().method() !== "PATCH") {
        await route.fallback();
        return;
      }
      capturedBody = route.request().postData();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { ...regularUser, first_name: "Renamed" }, message: "ok" }),
      });
    });

    await page.goto(`/tr/admin/users/${regularUser.id}`);
    await page.locator('input[name="first_name"]').fill("Renamed");
    await page.getByRole("button", { name: /Değişiklikleri kaydet/ }).click();

    await expect.poll(() => capturedBody).toContain('"first_name":"Renamed"');
  });

  test("deactivate opens confirm and hits /deactivate on confirm", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);
    const deactivate = await mockAdminUserAction(
      page,
      new RegExp(`.*/api/v1/admin/users/${regularUser.id}/deactivate$`),
      "POST",
    );

    await page.goto(`/tr/admin/users/${regularUser.id}`);
    await page.getByRole("button", { name: /Hesabı pasifleştir/ }).click();
    await expect(page.getByRole("heading", { name: /pasifleştirilsin/ })).toBeVisible();
    await page.getByRole("button", { name: /^Pasifleştir$/ }).click();

    await expect.poll(() => deactivate.calls).toBeGreaterThan(0);
  });

  test("activate button is rendered for inactive users and hits /activate", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, inactiveUser);
    await mockAdminActivities(page);
    const activate = await mockAdminUserAction(
      page,
      new RegExp(`.*/api/v1/admin/users/${inactiveUser.id}/activate$`),
      "POST",
    );

    await page.goto(`/tr/admin/users/${inactiveUser.id}`);
    await page.getByRole("button", { name: /Hesabı aktifleştir/ }).click();
    await page.getByRole("button", { name: /^Aktifleştir$/ }).click();

    await expect.poll(() => activate.calls).toBeGreaterThan(0);
  });

  test("reset-password confirm hits /reset-password", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);
    const reset = await mockAdminUserAction(
      page,
      new RegExp(`.*/api/v1/admin/users/${regularUser.id}/reset-password(\\?.*)?$`),
      "POST",
    );

    await page.goto(`/tr/admin/users/${regularUser.id}`);
    await page
      .locator("div.bg-destructive\\/5")
      .getByRole("button", { name: /Şifre sıfırlama gönder/ })
      .click();
    await page.getByRole("button", { name: /Sıfırlama e-postası gönder/ }).click();

    await expect.poll(() => reset.calls).toBeGreaterThan(0);
  });

  test("delete confirm hits DELETE and redirects back to users", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, regularUser);
    await mockAdminActivities(page);

    const state = { calls: 0 };
    await page.route(new RegExp(`.*/api/v1/admin/users/${regularUser.id}$`), async (route) => {
      if (route.request().method() !== "DELETE") {
        await route.fallback();
        return;
      }
      state.calls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "ok" }),
      });
    });
    await page.route(/.*\/api\/v1\/admin\/users(\?.*)?$/, async (route) => {
      if (route.request().method() !== "GET") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0, skip: 0, limit: 25 }),
      });
    });

    await page.goto(`/tr/admin/users/${regularUser.id}`);
    await page.getByRole("button", { name: /Kullanıcıyı sil/ }).click();
    await page
      .getByRole("button", { name: /^Kullanıcıyı sil$/ })
      .last()
      .click();

    await expect.poll(() => state.calls).toBeGreaterThan(0);
    await expect(page).toHaveURL(/.*\/tr\/admin\/users(\?.*)?$/);
  });

  test("self-targeted destructive buttons are disabled", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await mockAdminUserDetail(page, adminUser);
    await mockAdminActivities(page);

    await page.goto(`/tr/admin/users/${adminUser.id}`);
    await expect(page.getByRole("button", { name: /Hesabı pasifleştir/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Kullanıcıyı sil/ })).toBeDisabled();
  });
});
