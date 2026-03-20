import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";

import { server } from "./msw/server";

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: () => new Map(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: (ns: string | string[]) => {
    const namespace = Array.isArray(ns) ? ns[0] : ns;
    return {
      t: (key: string) => (namespace ? `${namespace}:${key}` : key),
      i18n: {
        changeLanguage: () => Promise.resolve(),
        language: "en",
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));
// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(
    (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  ),
});

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after the tests are finished.
afterAll(() => {
  server.close();
});
