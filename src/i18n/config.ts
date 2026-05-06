import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { env } from "@/env";
import { defaultLocale, locales } from "@/lib/config/routes";

import enAccount from "./locales/en/account.json";
import enAdmin from "./locales/en/admin.json";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enProfile from "./locales/en/profile.json";
import enSeo from "./locales/en/seo.json";
import enSuccess from "./locales/en/success.json";
import enValidation from "./locales/en/validation.json";
import trAccount from "./locales/tr/account.json";
import trAdmin from "./locales/tr/admin.json";
import trAuth from "./locales/tr/auth.json";
import trCommon from "./locales/tr/common.json";
import trDashboard from "./locales/tr/dashboard.json";
import trErrors from "./locales/tr/errors.json";
import trHome from "./locales/tr/home.json";
import trProfile from "./locales/tr/profile.json";
import trSeo from "./locales/tr/seo.json";
import trSuccess from "./locales/tr/success.json";
import trValidation from "./locales/tr/validation.json";

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
    account: enAccount,
    admin: enAdmin,
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
    account: trAccount,
    admin: trAdmin,
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
      "dashboard",
      "profile",
      "seo",
      "account",
      "admin",
    ],

    interpolation: {
      escapeValue: false,
      defaultVariables: {
        appName: env.NEXT_PUBLIC_APP_NAME,
      },
    },

    react: {
      useSuspense: false,
    },
  })
  .catch((error: unknown) => {
    console.error("i18n initialized failed:", error);
  });

export default i18n;
