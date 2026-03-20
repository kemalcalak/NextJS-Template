import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests-e2e",
  /* Global timeout for each test in milliseconds. */
  timeout: 10000,
  expect: {
    /* Timeout for each expectation in milliseconds. */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Use parallel workers for faster test execution */
  workers: process.env.CI ? 4 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Action timeout in milliseconds. */
    actionTimeout: 10000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Disable video recording for faster test execution */
    video: "off",

    /* Only take screenshots on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
