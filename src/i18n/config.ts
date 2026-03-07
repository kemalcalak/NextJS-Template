import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enProfile from "./locales/en/profile.json";
import enSuccess from "./locales/en/success.json";
import enValidation from "./locales/en/validation.json";
import trAuth from "./locales/tr/auth.json";
import trCommon from "./locales/tr/common.json";
import trDashboard from "./locales/tr/dashboard.json";
import trErrors from "./locales/tr/errors.json";
import trHome from "./locales/tr/home.json";
import trProfile from "./locales/tr/profile.json";
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
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ["en", "tr"],

    fallbackLng: "en",

    interpolation: {
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
