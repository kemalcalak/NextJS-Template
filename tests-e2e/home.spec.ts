import { test, expect } from "./base-test";

test.describe("Basic Navigation", () => {
  test("should render SEO tags on the home page", async ({ page }) => {
    await page.goto("/tr");

    // Browser title with Brand Suffix from layout template (%s — Brand)
    // "Günlük Görevlerinizi Yönetin — NextJS Template"
    await expect(page).toHaveTitle(/Günlük Görevlerinizi Yönetin — NextJS Template/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Günlük görevlerinizi ve projelerinizi yönetmek için en iyi platform. Hızlı, güvenli ve şık.",
    );

    const canonical = page.locator('link[rel="canonical"]');
    // Allow optional trailing slash
    await expect(canonical).toHaveAttribute("href", /.*\/tr\/?$/);

    const ogTitle = page.locator('meta[property="og:title"]');
    // OG Title doesn't use the template in buildMetadata
    await expect(ogTitle).toHaveAttribute("content", "Günlük Görevlerinizi Yönetin");
  });

  test("should show 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/tr/non-existent-page");
    await expect(page.locator("text=Sayfa Bulunamadı").first()).toBeVisible();
    await expect(page).toHaveURL(/.*\/tr\/non-existent-page/);
  });

  test("should persist language via cookie", async ({ context, page }) => {
    // Set cookie explicitly using domain/path instead of url to try to avoid the "url or path" error
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "tr",
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    await page.goto("/");
    // Should be redirected to /tr
    await expect(page).toHaveURL(/.*\/tr/);
  });
});
