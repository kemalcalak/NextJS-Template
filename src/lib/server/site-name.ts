import { env } from "@/env";
import type { PublicSettingsResponse } from "@/lib/types/system-settings";

// Last-resort name when the backend public settings cannot be reached (e.g. at
// build time or if the API is down). The real value comes from `site_name`.
const FALLBACK_SITE_NAME = "App";

/**
 * Fetch the site name from the backend public settings, for SSR/SEO surfaces
 * (root metadata, OpenGraph image) that cannot use the client `useBranding`
 * hook. Cached for 5 minutes and fails open to {@link FALLBACK_SITE_NAME}.
 */
export async function getServerSiteName(): Promise<string> {
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_API_URL}${env.NEXT_PUBLIC_API_PREFIX}/settings/public`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return FALLBACK_SITE_NAME;
    const json = (await res.json()) as PublicSettingsResponse;
    const name = json.data?.site_name;
    return typeof name === "string" && name.length > 0 ? name : FALLBACK_SITE_NAME;
  } catch {
    return FALLBACK_SITE_NAME;
  }
}
