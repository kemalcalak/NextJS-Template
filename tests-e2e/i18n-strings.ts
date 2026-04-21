import enAccount from "../src/i18n/locales/en/account.json";
import enAdmin from "../src/i18n/locales/en/admin.json";
import enAuth from "../src/i18n/locales/en/auth.json";
import enCommon from "../src/i18n/locales/en/common.json";
import enDashboard from "../src/i18n/locales/en/dashboard.json";
import enHome from "../src/i18n/locales/en/home.json";
import enProfile from "../src/i18n/locales/en/profile.json";
import enSeo from "../src/i18n/locales/en/seo.json";
import trAccount from "../src/i18n/locales/tr/account.json";
import trAdmin from "../src/i18n/locales/tr/admin.json";
import trAuth from "../src/i18n/locales/tr/auth.json";
import trCommon from "../src/i18n/locales/tr/common.json";
import trDashboard from "../src/i18n/locales/tr/dashboard.json";
import trHome from "../src/i18n/locales/tr/home.json";
import trProfile from "../src/i18n/locales/tr/profile.json";
import trSeo from "../src/i18n/locales/tr/seo.json";

// Locales in E2E coverage. Keep the list explicit so reports pair 1:1 with
// the iteration and it's obvious when a locale regresses.
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

const bundles = {
  tr: {
    account: trAccount,
    admin: trAdmin,
    auth: trAuth,
    common: trCommon,
    dashboard: trDashboard,
    home: trHome,
    profile: trProfile,
    seo: trSeo,
  },
  en: {
    account: enAccount,
    admin: enAdmin,
    auth: enAuth,
    common: enCommon,
    dashboard: enDashboard,
    home: enHome,
    profile: enProfile,
    seo: enSeo,
  },
} as const;

export const getStrings = (locale: Locale) => bundles[locale];

// Escape regex metacharacters so translated copy can be embedded in
// `new RegExp(...)` locators without tripping on punctuation like "?".
export const reEscape = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
