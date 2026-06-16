import { env } from "@/env";
import { usePublicSettings } from "@/hooks/api/use-system-settings";

interface Branding {
  siteName: string;
  logoUrl: string;
}

/**
 * Resolve site branding from the public settings, falling back to the build-time
 * app name while the settings load (or if they are unset). The logo is a URL
 * stored on Cloudinary; an empty string means "no logo — use the letter badge".
 */
export function useBranding(): Branding {
  const { data } = usePublicSettings();
  const siteName =
    (typeof data?.data.site_name === "string" && data.data.site_name) || env.NEXT_PUBLIC_APP_NAME;
  const logoUrl = typeof data?.data.logo_url === "string" ? data.data.logo_url : "";
  return { siteName, logoUrl };
}
