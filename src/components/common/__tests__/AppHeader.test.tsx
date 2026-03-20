import { screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { AppHeader } from "@/components/common/AppHeader";
import type { User } from "@/lib/types/user";
import { useAuthStore } from "@/stores/auth.store";
import { renderWithProviders } from "@/test/test-utils";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({ locale: "en" }),
}));

// Mock the auth store
vi.mock("@/stores/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "1",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  role: "USER",
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_deleted: false,
  title: null,
  deleted_at: null,
  ...overrides,
});

describe("AppHeader Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login and register buttons when unauthenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setToken: vi.fn(),
      isLoading: false,
    });

    renderWithProviders(<AppHeader />);

    expect(screen.getByRole("button", { name: /auth:login\.submitButton/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /auth:register\.submitButton/i }),
    ).toBeInTheDocument();
  });

  it("renders user dropdown menu when authenticated", () => {
    // Mock authenticated state
    vi.mocked(useAuthStore).mockReturnValue({
      user: createMockUser({ email: "test@example.com", first_name: "Test", last_name: "User" }),
      token: "fake-token",
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setToken: vi.fn(),
      isLoading: false,
    });

    renderWithProviders(<AppHeader />);

    // The user avatar button should be visible instead of login/register
    expect(screen.queryByRole("button", { name: /auth\.login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auth\.register/i })).not.toBeInTheDocument();

    // The user's mock avatar fallback 'T' (from Test User) should be rendered
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders theme and language toggle buttons", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      setUser: vi.fn(),
      setToken: vi.fn(),
      isLoading: false,
    });

    renderWithProviders(<AppHeader />);

    expect(screen.getByRole("button", { name: /common:ui\.toggleTheme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /common:ui\.toggleLanguage/i })).toBeInTheDocument();
  });
});
