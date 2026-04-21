import { test, expect } from "../base-test";
import { LOCALES, getStrings, reEscape } from "../i18n-strings";

for (const locale of LOCALES) {
  const s = getStrings(locale);

  test.describe(`Login Flow [${locale}]`, () => {
    test("SEO - should have correct title and description", async ({ page }) => {
      await page.goto(`/${locale}/login`);
      await expect(page).toHaveTitle(new RegExp(reEscape(s.seo.login.title), "i"));
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", s.seo.login.description);
    });

    test("should login successfully with valid credentials", async ({ page }) => {
      await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: {
            "Set-Cookie": "access_token=fake-jwt-token; Path=/; HttpOnly; SameSite=Lax",
          },
          body: JSON.stringify({
            access_token: "fake-jwt-token",
            token_type: "bearer",
            user: { id: "1", email: "test@example.com", first_name: "Test" },
          }),
        });
      });

      await page.route("**/api/v1/users/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "1", email: "test@example.com", first_name: "Test" }),
        });
      });

      await page.goto(`/${locale}/login`);

      // pressSequentially fires per-character events so react-hook-form
      // registers the value on webkit; bare page.fill() can drop the email
      // input there.
      await page.locator('input[name="email"]').pressSequentially("test@example.com");
      await page.locator('input[name="password"]').pressSequentially("Password123!");
      await page.click('button[type="submit"]');

      await page.waitForURL(new RegExp(`.*/${locale}/dashboard`));
    });

    test("should show error message on invalid credentials", async ({ page }) => {
      await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Invalid credentials" }),
        });
      });

      await page.goto(`/${locale}/login`);
      await page.locator('input[name="email"]').pressSequentially("wrong@example.com");
      await page.locator('input[name="password"]').pressSequentially("wrongpass");
      await page.click('button[type="submit"]');

      await expect(page.getByText("Invalid credentials").first()).toBeVisible();
    });

    test("should show validation errors on empty fields", async ({ page }) => {
      await page.goto(`/${locale}/login`);
      await page.click('button[type="submit"]');

      // Validation copy lives in the validation namespace across both locales.
      await expect(
        page.locator("text=Email gereklidir").or(page.locator("text=Email is required")).first(),
      ).toBeVisible();
      await expect(
        page.locator("text=Şifre gereklidir").or(page.locator("text=Password is required")).first(),
      ).toBeVisible();
    });

    test("should navigate to register page", async ({ page }) => {
      await page.goto(`/${locale}/login`);
      await page.getByText(s.auth.login.register, { exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`.*/${locale}/register`));
    });

    test("should toggle password visibility", async ({ page }) => {
      await page.goto(`/${locale}/login`);
      const passwordInput = page.locator('input[name="password"]');

      await expect(passwordInput).toHaveAttribute("type", "password");
      await page.click('button[aria-label*="password"i]');
      await expect(passwordInput).toHaveAttribute("type", "text");
      await page.click('button[aria-label*="password"i]');
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });
}
