"use client";

import { useBranding } from "@/hooks/use-branding";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  // Sizing/radius/hover classes from the call site (e.g. "h-8 w-8 rounded-xl text-sm").
  className?: string;
}

/**
 * The brand mark: the uploaded logo when set, otherwise the first-letter badge.
 *
 * The logo is rendered ``object-contain`` (never cropped) since it is a
 * transparent, often rectangular image; only the badge fallback gets the
 * gradient fill.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  const { siteName, logoUrl } = useBranding();

  if (logoUrl) {
    return (
      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden", className)}>
        <img src={logoUrl} alt={siteName} className="h-full w-full object-contain" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-primary/70 font-display font-semibold text-primary-foreground shadow-md shadow-primary/25",
        className,
      )}
    >
      {siteName.charAt(0).toUpperCase()}
    </span>
  );
}
