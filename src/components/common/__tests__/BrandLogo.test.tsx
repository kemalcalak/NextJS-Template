import { screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { BrandLogo } from "@/components/common/BrandLogo";
import { useBranding } from "@/hooks/use-branding";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/hooks/use-branding", () => ({
  useBranding: vi.fn(),
}));

describe("BrandLogo", () => {
  it("renders the logo image (uncropped, object-contain) when a logo URL is set", () => {
    vi.mocked(useBranding).mockReturnValue({
      siteName: "Acme",
      logoUrl: "https://cdn.example.com/logo.png",
    });

    renderWithProviders(<BrandLogo className="h-8 w-8" />);

    const img = screen.getByRole("img", { name: "Acme" });
    // next/image rewrites src to its optimizer URL; the original is encoded in it.
    expect(img.getAttribute("src")).toContain("cdn.example.com");
    expect(img.className).toContain("object-contain");
  });

  it("renders nothing when no logo is set (no letter-badge fallback)", () => {
    vi.mocked(useBranding).mockReturnValue({ siteName: "Acme", logoUrl: "" });

    const { container } = renderWithProviders(<BrandLogo className="h-8 w-8" />);

    expect(container.querySelector("img")).toBeNull();
    // The first-letter badge fallback was removed, so "A" must not appear.
    expect(screen.queryByText("A")).toBeNull();
  });
});
