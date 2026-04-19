import type { AdminActivity } from "@/lib/types/admin";

import { test, expect } from "../base-test";
import { adminUser, injectSession, mockMe } from "./admin-helpers";

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

test.describe("Admin activities", () => {
  test("renders rows returned by the backend", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await captureActivitiesRequests(page, [baseActivity, badLogin]);

    await page.goto("/tr/admin/activities");

    await expect(page.getByRole("heading", { name: "Aktivite günlüğü" })).toBeVisible();
    // Two rows; verify status labels resolve for both.
    await expect(page.getByText("Başarılı").first()).toBeVisible();
    await expect(page.getByText("Başarısız").first()).toBeVisible();
    // Scalar details render as key/value chips.
    await expect(page.getByText("reason").first()).toBeVisible();
    await expect(page.getByText("invalid_password").first()).toBeVisible();
  });

  test("empty state renders when no rows match", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await captureActivitiesRequests(page, []);

    await page.goto("/tr/admin/activities");
    await expect(page.getByText("Seçili filtrelerle eşleşen aktivite yok.").first()).toBeVisible();
  });

  test("changing the type filter re-queries with the new param", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    const captured = await captureActivitiesRequests(page, [baseActivity]);

    await page.goto("/tr/admin/activities");
    // Wait for the first request to settle
    await expect(page.getByRole("heading", { name: "Aktivite günlüğü" })).toBeVisible();

    // Click the type Select and pick "login"
    await page.getByLabel("Tür").click();
    await page.getByRole("option", { name: "login" }).click();

    // The latest captured request must carry activity_type=login
    await expect.poll(() => captured.at(-1) ?? "").toContain("activity_type=login");
  });

  test("reset button appears after a filter is set and clears state", async ({ page }) => {
    await injectSession(page, adminUser);
    await mockMe(page, adminUser);
    await captureActivitiesRequests(page, [baseActivity]);

    await page.goto("/tr/admin/activities");

    await expect(page.getByRole("button", { name: /Filtreleri temizle/ })).toHaveCount(0);

    await page.getByLabel("Durum").click();
    await page.getByRole("option", { name: "Başarısız" }).click();

    const resetButton = page.getByRole("button", { name: /Filtreleri temizle/ });
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    await expect(resetButton).toHaveCount(0);
  });
});
