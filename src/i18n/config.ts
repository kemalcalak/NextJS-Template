import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { defaultLocale, locales } from "@/lib/config/routes";

import enAbout from "./locales/en/about.json";
import enAccount from "./locales/en/account.json";
import enAdmin from "./locales/en/admin.json";
import enAuth from "./locales/en/auth.json";
import enBroadcasts from "./locales/en/broadcasts.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enNotifications from "./locales/en/notifications.json";
import enProfile from "./locales/en/profile.json";
import enSeo from "./locales/en/seo.json";
import enSuccess from "./locales/en/success.json";
import enSupport from "./locales/en/support.json";
import enSystemSettings from "./locales/en/system-settings.json";
import enUpload from "./locales/en/upload.json";
import enValidation from "./locales/en/validation.json";
import trAbout from "./locales/tr/about.json";
import trAccount from "./locales/tr/account.json";
import trAdmin from "./locales/tr/admin.json";
import trAuth from "./locales/tr/auth.json";
import trBroadcasts from "./locales/tr/broadcasts.json";
import trCommon from "./locales/tr/common.json";
import trDashboard from "./locales/tr/dashboard.json";
import trErrors from "./locales/tr/errors.json";
import trHome from "./locales/tr/home.json";
import trNotifications from "./locales/tr/notifications.json";
import trProfile from "./locales/tr/profile.json";
import trSeo from "./locales/tr/seo.json";
import trSuccess from "./locales/tr/success.json";
import trSupport from "./locales/tr/support.json";
import trSystemSettings from "./locales/tr/system-settings.json";
import trUpload from "./locales/tr/upload.json";
import trValidation from "./locales/tr/validation.json";

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    errors: enErrors,
    success: enSuccess,
    home: enHome,
    about: enAbout,
    dashboard: enDashboard,
    profile: enProfile,
    seo: enSeo,
    account: enAccount,
    admin: enAdmin,
    notifications: enNotifications,
    support: enSupport,
    upload: enUpload,
    broadcasts: enBroadcasts,
    systemSettings: enSystemSettings,
  },
  tr: {
    common: trCommon,
    auth: trAuth,
    validation: trValidation,
    errors: trErrors,
    success: trSuccess,
    home: trHome,
    about: trAbout,
    dashboard: trDashboard,
    profile: trProfile,
    seo: trSeo,
    account: trAccount,
    admin: trAdmin,
    notifications: trNotifications,
    support: trSupport,
    upload: trUpload,
    broadcasts: trBroadcasts,
    systemSettings: trSystemSettings,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...locales],

    fallbackLng: defaultLocale,
    defaultNS: "common",
    ns: [
      "common",
      "auth",
      "validation",
      "errors",
      "success",
      "home",
      "about",
      "dashboard",
      "profile",
      "seo",
      "account",
      "admin",
      "notifications",
      "support",
      "upload",
      "broadcasts",
      "systemSettings",
    ],

    interpolation: {
      // React escapes every interpolated value at render time, so i18next's own
      // escaping is redundant — this is the i18next-recommended setting for React.
      // RULE: never render a t() result as raw HTML (no dangerouslySetInnerHTML,
      // no non-React DOM sink). Otherwise user input interpolated into a
      // translation would bypass React's escaping and become XSS.
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  })
  .catch((error: unknown) => {
    console.error("i18n initialized failed:", error);
  });

export default i18n;
