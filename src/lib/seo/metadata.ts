// Import SEO translations directly (server-side, no i18n client needed)
import enSeo from "@/i18n/locales/en/seo.json";
import trSeo from "@/i18n/locales/tr/seo.json";

import type { BuildMetadataOptions, SeoLocale, SeoPageKey } from "./types";
import type { Metadata } from "next";

/**
 * Validates and normalizes locale string to SeoLocale type.
 * Falls back to "en" for unsupported locales.
 */
export function validateLocale(locale: string): SeoLocale {
  return (["en", "tr"].includes(locale) ? locale : "en") as SeoLocale;
}

const seoTranslations: Record<SeoLocale, Record<string, { title: string; description: string }>> = {
  en: enSeo,
  tr: trSeo,
};

// Base URL for canonical and OG URLs — defaults to localhost in dev
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Supported locales for hreflang alternate links
const SUPPORTED_LOCALES: SeoLocale[] = ["en", "tr"];

/**
 * Resolves the page meta (title + description) for the given locale and page key.
 * Falls back to the "en" locale if the key is missing in the requested locale.
 */
function resolvePageMeta(
  locale: SeoLocale,
  pageKey: SeoPageKey,
  overrides?: Partial<{ title: string; description: string }>,
): { title: string; description: string } {
  const translations = seoTranslations[locale] ?? seoTranslations.en;
  const fallback = seoTranslations.en[pageKey] ?? { title: "NextJS Template", description: "" };
  const base = translations[pageKey] ?? fallback;

  return {
    title: overrides?.title ?? base.title,
    description: overrides?.description ?? base.description,
  };
}

/**
 * Builds a full Next.js Metadata object for a given locale and page.
 * Includes title, description, canonical URL, hreflang alternates,
 * OpenGraph and Twitter Card tags.
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const { locale, pageKey, pathname = "", overrides } = options;

  const { title, description } = resolvePageMeta(locale, pageKey, overrides);

  // Canonical URL for this locale
  const canonicalUrl = `${BASE_URL}/${locale}${pathname}`;

  // Build alternate language URLs for hreflang
  const alternateLanguages = SUPPORTED_LOCALES.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = `${BASE_URL}/${lang}${pathname}`;
    return acc;
  }, {});

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "NextJS Template",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
