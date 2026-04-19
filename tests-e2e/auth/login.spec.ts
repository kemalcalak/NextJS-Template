import { test, expect } from "../base-test";

test.describe("Login Flow", () => {
  test("SEO - should have correct title and description", async ({ page }) => {
    await page.goto("/tr/login");
    // Flexible regex for title (with or without brand suffix)
    await expect(page).toHaveTitle(/Giriş Yap/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Dashboard'unuza ve projelerinize erişmek için NextJS Template hesabınıza giriş yapın.",
    );
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Mock the login API
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

    // Mock successful 2nd request for me api
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "1", email: "test@example.com", first_name: "Test" }),
      });
    });

    await page.goto("/tr/login");

    // pressSequentially fires per-character events so react-hook-form
    // registers the value on webkit; bare page.fill() can drop the email
    // input there.
    await page.locator('input[name="email"]').pressSequentially("test@example.com");
    await page.locator('input[name="password"]').pressSequentially("Password123!");
    await page.click('button[type="submit"]');

    // Expected transition to dashboard
    await page.waitForURL(/.*\/tr\/dashboard/);
  });

  test("should show error message on invalid credentials", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Invalid credentials" }),
      });
    });

    await page.goto("/tr/login");

    await page.locator('input[name="email"]').pressSequentially("wrong@example.com");
    await page.locator('input[name="password"]').pressSequentially("wrongpass");
    await page.click('button[type="submit"]');

    // Expected error message from API
    await expect(page.locator("text=Invalid credentials").first()).toBeVisible();
  });

  test("should show validation errors on empty fields", async ({ page }) => {
    await page.goto("/tr/login");
    await page.click('button[type="submit"]');

    // Standard zod/hook-form error messages from validation:emailRequired etc.
    // "Email gereklidir" or "Email is required"
    await expect(
      page.locator("text=Email gereklidir").or(page.locator("text=Email is required")).first(),
    ).toBeVisible();

    // Password validation message check
    await expect(
      page.locator("text=Şifre gereklidir").or(page.locator("text=Password is required")).first(),
    ).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/tr/login");
    // Link to register page (t("auth:login.noAccount"))
    // From auth.json: "Kayıt Ol"
    await page.click("text=Kayıt Ol");
    await expect(page).toHaveURL(/.*\/tr\/register/);
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/tr/login");
    const passwordInput = page.locator('input[name="password"]');

    await expect(passwordInput).toHaveAttribute("type", "password");
    // Use a more flexible locator that doesn't change with state or re-find after state change
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.click('button[aria-label*="password"i]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
