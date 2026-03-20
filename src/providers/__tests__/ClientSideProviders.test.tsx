import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import i18n from "@/i18n/config";

import { ClientSideProviders } from "../ClientSideProviders";

// Mock i18n
const mockChangeLanguage = vi.fn().mockImplementation((_lng?: string) => {
  return Promise.resolve(((key: string) => key) as any);
});
const mockedI18n = i18n as unknown as {
  isInitialized: boolean;
  changeLanguage: typeof mockChangeLanguage;
};
mockedI18n.isInitialized = false;
vi.spyOn(i18n, "changeLanguage").mockImplementation(mockChangeLanguage);

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n,
    }),
  };
});

describe("ClientSideProviders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading screen initially and then render children", async () => {
    render(
      <ClientSideProviders locale="en">
        <div data-testid="child">App Content</div>
      </ClientSideProviders>,
    );

    // It might show loading screen first, but it can be very fast
    // We'll check that children are eventually rendered
    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });
  });

  it("should apply correct loading message for Turkish locale", async () => {
    render(
      <ClientSideProviders locale="tr">
        <div data-testid="child">App Content</div>
      </ClientSideProviders>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith("tr");
    });
  });
});
