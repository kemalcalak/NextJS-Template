import { LANGUAGES } from "@/i18n/server";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static routes that should be in sitemap
  const staticRoutes = ["", "/auth/login", "/auth/register", "/auth/forgot-password"];

  const locales = LANGUAGES; // ["en", "tr"]

  const sitemapEntries: MetadataRoute.Sitemap = [];

  staticRoutes.forEach((route) => {
    // Add entry for each locale
    locales.forEach((locale) => {
      const url = `${baseUrl}/${locale}${route}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
        // Hreflang alternates can be added here if needed,
        // but Next.js handled them in layout usually.
        // For sitemap, we just list the localized versions.
      });
    });
  });

  return sitemapEntries;
}
