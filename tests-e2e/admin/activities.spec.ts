import type { AdminActivity } from "@/lib/types/admin";

import { test, expect } from "../base-test";
import { adminUser, injectSession, mockMe } from "./admin-helpers";
import { LOCALES, getStrings } from "./admin-strings";

import type { Page } from "@playwright/test";

const baseActivity: AdminActivity = {
  id: "a-1",
  user_id: "admin-1",
  activity_type: "login",
  resource_type: "auth",
  resource_id: null,
  details: { reason: "ok" },
  status: "success",
  ip_address: "127.0.0.1",
  user_agent: "pw",
  created_at: "2026-04-19T12:00:00Z",
};

const badLogin: AdminActivity = {
  ...baseActivity,
  id: "a-2",
  activity_type: "login",
  status: "failure",
  details: { reason: "invalid_password" },
  created_at: "2026-04-19T12:05:00Z",
};

// Captures every query-string the activities list is called with, so tests
// can assert that filter state propagates to the request.
const captureActivitiesRequests = async (page: Page, rows: AdminActivity[]): Promise<string[]> => {
  const captured: string[] = [];
  await page.route(/.*\/api\/v1\/admin\/activities(\?.*)?$/, async (route) => {
    captured.push(new URL(route.request().url()).search);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: rows, total: rows.length, skip: 0, limit: 25 }),
    });
  });
  return captured;
};

for (const locale of LOCALES) {
  const s = getStrings(locale).admin;

  test.describe(`Admin activities [${locale}]`, () => {
    test("renders rows returned by the backend", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await captureActivitiesRequests(page, [baseActivity, badLogin]);

      await page.goto(`/${locale}/admin/activities`);

      await expect(page.getByRole("heading", { name: s.activities.title })).toBeVisible();
      await expect(page.getByText(s.activities.status.success).first()).toBeVisible();
      await expect(page.getByText(s.activities.status.failure).first()).toBeVisible();
      await expect(page.getByText("reason").first()).toBeVisible();
      await expect(page.getByText("invalid_password").first()).toBeVisible();
    });

    test("empty state renders when no rows match", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await captureActivitiesRequests(page, []);

      await page.goto(`/${locale}/admin/activities`);
      await expect(page.getByText(s.activities.empty).first()).toBeVisible();
    });

    test("changing the type filter re-queries with the new param", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      const captured = await captureActivitiesRequests(page, [baseActivity]);

      await page.goto(`/${locale}/admin/activities`);
      await expect(page.getByRole("heading", { name: s.activities.title })).toBeVisible();

      await page.getByLabel(s.activities.filters.type).click();
      await page.getByRole("option", { name: s.activities.type.login }).click();

      await expect.poll(() => captured.at(-1) ?? "").toContain("activity_type=login");
    });

    test("reset button appears after a filter is set and clears state", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await captureActivitiesRequests(page, [baseActivity]);

      await page.goto(`/${locale}/admin/activities`);

      await expect(page.getByRole("button", { name: s.activities.filters.reset })).toHaveCount(0);

      await page.getByLabel(s.activities.filters.status).click();
      await page.getByRole("option", { name: s.activities.status.failure }).click();

      const resetButton = page.getByRole("button", { name: s.activities.filters.reset });
      await expect(resetButton).toBeVisible();
      await resetButton.click();
      await expect(resetButton).toHaveCount(0);
    });
  });
}
