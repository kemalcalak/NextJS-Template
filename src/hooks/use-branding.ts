import { usePublicSettings } from "@/hooks/api/use-system-settings";

interface Branding {
  siteName: string;
  logoUrl: string;
}

/**
 * Resolve site branding from the public settings. The site name and logo come
 * solely from the backend ``site_name`` / ``logo_url`` settings (empty while the
 * settings load or if unset); an empty ``logoUrl`` means "no logo".
 */
export function useBranding(): Branding {
  const { data } = usePublicSettings();
  const siteName = typeof data?.data.site_name === "string" ? data.data.site_name : "";
  const logoUrl = typeof data?.data.logo_url === "string" ? data.data.logo_url : "";
  return { siteName, logoUrl };
}
