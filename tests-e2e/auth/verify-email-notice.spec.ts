import { test, expect } from "../base-test";

test.describe("Verify Email Notice Flow", () => {
  test("should display notice and handle resend when navigated with email parameter", async ({
    page,
  }) => {
    const testEmail = "test@example.com";
    await page.goto(`/tr/verify-email-notice?email=${encodeURIComponent(testEmail)}`);

    // Should stay on the page and show correct elements
    await expect(page).toHaveURL(
      new RegExp(`.*verify-email-notice.*email=${encodeURIComponent(testEmail)}`),
    );
    await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);

    // Link back to login (t("auth:verifyEmail.backToLogin"))
    // From auth.json: "Giriş Ekranına Dön"
    await expect(
      page.getByRole("link", { name: /Giriş Ekranına Dön|Back to Login/i }),
    ).toBeVisible();

    // Mock successful resend-verification response
    await page.route("**/api/v1/auth/resend-verification*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Verification email resent" }),
      });
    });

    // Click Resend button
    await page.click('button:has-text("Doğrulama E-postasını Tekrar Gönder")');

    // Should show success toast
    await expect(
      page.locator("text=tekrar gönderildi").or(page.locator("text=resent")).first(),
    ).toBeVisible();
  });

  test("should not redirect if email parameter is missing (middleware might handle it differently, assuming current behavior stays on page with empty input)", async ({
    page,
  }) => {
    await page.goto("/tr/verify-email-notice");
    await expect(page).toHaveURL(/.*verify-email-notice/);
    await expect(page.locator('input[name="email"]')).toHaveValue("");
  });
});
