import { test as base, expect } from "@playwright/test";

/**
 * Base test fixture that automatically mocks all API requests
 * to ensure no test accidentally hits the real backend.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Global interceptor for all API v1 calls
    // If a specific test mocks the same URL, it will take precedence or we can use route.continue()
    // By default, we block any unmocked API call with a 401 error.
    // Global interceptor for all API calls
    await page.route(
      (url) => url.pathname.includes("/api/v1/"),
      async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        // If we are here, it means no other (later registered) route matched.
        // We block unmocked API calls with a 401.
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Unmocked API Request",
            detail: `[Global Interceptor] [${method}] ${url}`,
          }),
        });
      },
    );

    // page.route() does not cover WebSockets, so realtime sockets (account
    // events, support feed) would otherwise reach the real backend through the
    // dev proxy. Intercept API WebSockets and answer them locally — the handler
    // never calls connectToServer(), so nothing is forwarded to the backend.
    // Next.js HMR sockets (/_next/...) are intentionally left untouched.
    await page.routeWebSocket(/\/api\/v1\//, () => {
      // No-op mock: tests don't assert on realtime frames.
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };
