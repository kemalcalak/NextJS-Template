import { test, expect } from "../base-test";

test.describe("Register Flow", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/tr/register");
    // Flexible branding check
    await expect(page).toHaveTitle(/Hesap Oluştur/i);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Üye olun ve projelerinizi ücretsiz yönetmeye başlayın. Hızlı kayıt, kredi kartı gerekmez.",
    );
  });

  test("should register successfully with valid credentials", async ({ page }) => {
    // Mock the register API
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Registration successful",
          user: { id: "1", email: "test@example.com", first_name: "Test" },
        }),
      });
    });

    await page.goto("/tr/register");

    await page.fill('input[name="first_name"]', "John");
    await page.fill('input[name="last_name"]', "Doe");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");
    await page.click('button[type="submit"]');

    // Successful registration redirects to verify-email-notice
    await expect(page).toHaveURL(/.*\/tr\/verify-email-notice/);
    // Notice title from auth.json: "E-postanızı Doğrulayın"
    await expect(
      page.locator("text=Doğrulayın").or(page.locator("text=Verify")).first(),
    ).toBeVisible();
  });

  test("should show error on existing email", async ({ page }) => {
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "User with this email already exists" }),
      });
    });

    await page.goto("/tr/register");

    await page.fill('input[name="first_name"]', "John");
    await page.fill('input[name="last_name"]', "Doe");
    await page.fill('input[name="email"]', "existing@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=User with this email already exists").first()).toBeVisible();
  });

  test("should show validation errors on password mismatch", async ({ page }) => {
    await page.goto("/tr/register");

    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "WrongPass123!");
    await page.click('button[type="submit"]');

    // Translation: "Şifreler eşleşmiyor" (validation:confirmPasswordMismatch)
    await expect(
      page.locator("text=eşleşmiyor").or(page.locator("text=mismatch")).first(),
    ).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/tr/register");
    const passwordInput = page.locator('input[name="password"]');

    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
