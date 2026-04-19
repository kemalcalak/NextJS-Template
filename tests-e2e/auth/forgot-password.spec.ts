import { test, expect } from "../base-test";

test.describe("Forgot Password Flow (TR)", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/tr/forgot-password");
    await expect(page).toHaveTitle(/Şifremi Unuttum/i);

    const description = page.locator('meta[name="description"]');
    // Actual content: "E-posta adresinizi girin..."
    await expect(description).toHaveAttribute("content", /.*E-posta adresinizi girin.*/);

    // Canonical check
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /.*\/tr\/auth\/forgot-password/);
  });

  test("should show error on non-existent account email", async ({ page }) => {
    // Mock for email not found
    await page.route("**/api/v1/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "User with this email not found" }),
      });
    });

    await page.goto("/tr/forgot-password");

    // pressSequentially — webkit can drop values assigned via page.fill()
    // on controlled RHF inputs.
    await page.locator('input[name="email"]').pressSequentially("nonexistent@example.com");
    await page.click('button[type="submit"]');

    // Expected error message from API (handled by toast)
    await expect(page.locator("text=User with this email not found").first()).toBeVisible();
  });

  test("should successfully request password reset link", async ({ page }) => {
    // Mock successful request
    await page.route("**/api/v1/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Password reset link sent successfully" }),
      });
    });

    await page.goto("/tr/forgot-password");

    const testEmail = "valid@example.com";
    await page.locator('input[name="email"]').pressSequentially(testEmail);
    await page.click('button[type="submit"]');

    // Many apps show a success message on the same page instead of a hard redirect
    // We check for success text based on auth.json successTitle: "E-postanızı kontrol edin"
    await expect(
      page.locator("text=kontrol edin").or(page.locator("text=check your email")).first(),
    ).toBeVisible();
  });

  test("should show validation errors on invalid email", async ({ page }) => {
    await page.goto("/tr/forgot-password");
    await page.locator('input[name="email"]').pressSequentially("invalid-email");
    await page.click('button[type="submit"]');

    // Expected: "Geçerli bir email adresi girin" (t("validation:emailInvalid"))
    await expect(
      page.locator("text=Geçerli bir email").or(page.locator("text=Geçerli bir e-posta")).first(),
    ).toBeVisible();
  });
});

test.describe("Forgot Password Flow (EN)", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/en/forgot-password");
    await expect(page).toHaveTitle(/Forgot Password/i);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.*email address.*/);
  });

  test("should show validation errors on invalid email", async ({ page }) => {
    await page.goto("/en/forgot-password");
    await page.fill('input[name="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    // Expected: "Invalid email" or "Please enter a valid email" (validation:emailInvalid)
    await expect(
      page
        .locator("text=Invalid email")
        .or(page.locator("text=invalid-email"))
        .or(page.locator("text=valid email"))
        .first(),
    ).toBeVisible();
  });
});
