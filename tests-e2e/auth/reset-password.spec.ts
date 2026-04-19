import { test, expect } from "../base-test";

test.describe("Reset Password Flow - Initial State", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/tr/reset-password?token=some-token");
    // Flexible branding check
    await expect(page).toHaveTitle(/Şifre Sıfırla/i);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "NextJS Template hesabınız için yeni ve güvenli bir şifre belirleyin.",
    );
  });

  test("should show invalid link message if token is missing", async ({ page }) => {
    await page.goto("/tr/reset-password");

    // Should show invalid link state
    await expect(
      page.locator("text=Geçersiz Bağlantı").or(page.locator("text=Invalid Link")).first(),
    ).toBeVisible();
    await expect(page.locator('a[href*="/login"]')).toBeVisible();
  });
});

test.describe("Reset Password Flow - Valid Token State", () => {
  test("should show validation errors on password mismatch", async ({ page }) => {
    await page.goto("/tr/reset-password?token=valid-token");

    await page.fill('input[name="password"]', "NewPass123!");
    await page.fill('input[name="confirmPassword"]', "OtherPass123!");
    await page.click('button[type="submit"]');

    // Expected: "Şifreler eşleşmiyor" (t("validation:confirmPasswordMismatch"))
    await expect(
      page.locator("text=eşleşmiyor").or(page.locator("text=mismatch")).first(),
    ).toBeVisible();
  });

  test("should successfully reset password", async ({ page }) => {
    // Mock the reset password API
    await page.route("**/api/v1/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Password reset successful" }),
      });
    });

    await page.goto("/tr/reset-password?token=valid-token");

    // pressSequentially — webkit can drop values from bare page.fill() on
    // controlled RHF inputs.
    await page.locator('input[name="password"]').pressSequentially("NewPass123!");
    await page.locator('input[name="confirmPassword"]').pressSequentially("NewPass123!");
    await page.click('button[type="submit"]');

    // Successful reset should redirect to login or show success state
    // Many apps redirect back or show a notice
    // Translation: "Şifre Başarıyla Sıfırlandı!" (resetPassword.successTitle)
    await expect(
      page.locator("text=sıfırlandı").or(page.locator("text=reset successful")).first(),
    ).toBeVisible();

    // After success message, we might have a link to login or auto redirect
    await expect(page.locator('a[href*="/login"]')).toBeVisible();
  });

  test("should show error on invalid/expired token", async ({ page }) => {
    // Mock failed reset due to invalid token
    await page.route("**/api/v1/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expired or invalid" }),
      });
    });

    await page.goto("/tr/reset-password?token=invalid-token");

    await page.locator('input[name="password"]').pressSequentially("NewPass123!");
    await page.locator('input[name="confirmPassword"]').pressSequentially("NewPass123!");
    await page.click('button[type="submit"]');

    // API error detail or localized message
    await expect(
      page
        .locator("text=expired")
        .or(page.locator("text=geçersiz").or(page.locator("text=error")))
        .first(),
    ).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/tr/reset-password?token=valid-token");
    const passwordInput = page.locator('input[name="password"]');

    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
