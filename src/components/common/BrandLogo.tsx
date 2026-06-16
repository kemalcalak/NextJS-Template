"use client";

import { useBranding } from "@/hooks/use-branding";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  // Sizing/radius/hover classes from the call site (e.g. "h-8 w-8 rounded-xl text-sm").
  className?: string;
}

/**
 * The brand mark: the backend ``logo_url`` rendered ``object-contain`` (never
 * cropped — it is a transparent, often rectangular image). Renders nothing when
 * no logo is set; there is no letter-badge fallback.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  const { siteName, logoUrl } = useBranding();

  if (!logoUrl) return null;

  return (
    <span className={cn("flex shrink-0 items-center justify-center", className)}>
      <img src={logoUrl} alt={siteName} className="h-full w-full object-contain" />
    </span>
  );
}
