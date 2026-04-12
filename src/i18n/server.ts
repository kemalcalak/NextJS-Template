import { locales } from "@/lib/config/routes";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enProfile from "./locales/en/profile.json";
import enSeo from "./locales/en/seo.json";
import enSuccess from "./locales/en/success.json";
import enValidation from "./locales/en/validation.json";
import trAuth from "./locales/tr/auth.json";
import trCommon from "./locales/tr/common.json";
import trDashboard from "./locales/tr/dashboard.json";
import trErrors from "./locales/tr/errors.json";
import trHome from "./locales/tr/home.json";
import trProfile from "./locales/tr/profile.json";
import trSeo from "./locales/tr/seo.json";
import trSuccess from "./locales/tr/success.json";
import trValidation from "./locales/tr/validation.json";

export const LANGUAGES = locales;

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    success: enSuccess,
    home: enHome,
    dashboard: enDashboard,
    profile: enProfile,
    seo: enSeo,
  },
  tr: {
    common: trCommon,
    auth: trAuth,
    validation: trValidation,
    errors: trErrors,
    success: trSuccess,
    home: trHome,
    dashboard: trDashboard,
    profile: trProfile,
    seo: trSeo,
  },
} as const;

type Locale = keyof typeof resources;
type Namespace = keyof (typeof resources)["en"];

/**
 * Simple server-side translation helper for Edge/Server components
 * avoids i18next overhead for simple lookups.
 */
export function getServerTranslations(locale = "en", ns: Namespace = "common") {
  const activeLocale = (resources[locale as Locale] ? locale : "en") as Locale;
  const translations = resources[activeLocale][ns];

  return {
    t: (key: string, defaultValue?: string): string => {
      const keys = key.split(".");
      let result: unknown = translations;

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, unknown>)[k];
        } else {
          result = undefined;
          break;
        }
      }

      return typeof result === "string" ? result : defaultValue || key;
    },
  };
}
