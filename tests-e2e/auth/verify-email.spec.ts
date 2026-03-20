import { test, expect } from "../base-test";

test.describe("Verify Email", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/tr/verify-email?token=some-token");
    // Flexible branding check
    await expect(page).toHaveTitle(/E-postayı Doğrula/i);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Kaydınızı tamamlamak için lütfen e-posta adresinizi doğrulayın.",
    );
  });

  test("should display verifying state initially", async ({ page }) => {
    // Delay API response to ensure verifying state is visible
    await page.route("**/api/v1/auth/verify-email*", async (route) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Verified" }),
      });
    });

    await page.goto("/tr/verify-email?token=valid-token");
    // Flexible text check from auth.json verifyEmail.verifying
    await expect(page.locator("text=Doğrulanıyor").first()).toBeVisible();
  });

  test("should show success state on valid token", async ({ page }) => {
    // Mock successful verification
    await page.route("**/api/v1/auth/verify-email*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Verification successful" }),
      });
    });

    await page.goto("/tr/verify-email?token=valid-token");

    // Success text from auth.json verifyEmail.successTitle or successDesc
    await expect(page.locator("text=Doğrulandı").first()).toBeVisible();
    await expect(
      page.locator("text=başarıyla").or(page.locator("text=successfully")).first(),
    ).toBeVisible();

    // Link back to login (t("auth:verifyEmail.backToLogin") or loginNow)
    await expect(page.locator('a[href*="/login"]')).toBeVisible();
  });

  test("should show error on invalid token", async ({ page }) => {
    // Mock failed verification
    await page.route("**/api/v1/auth/verify-email*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expired or invalid" }),
      });
    });

    await page.goto("/tr/verify-email?token=invalid-token");

    // Error text check
    await expect(page.locator("text=Başarısız").first()).toBeVisible();
  });
});
