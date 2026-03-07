import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Create Next App/);
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  // Click the get started link (adjust selector if needed).
  // This is a default Next.js template check.
  await expect(page.getByRole("heading", { name: "Create Next App" })).toBeVisible();
});
