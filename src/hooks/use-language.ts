"use client";

import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string, callback?: () => void) => {
    i18n.changeLanguage(lng);
    document.cookie = `NEXT_LOCALE=${lng}; path=/; max-age=31536000; SameSite=Lax`;

    if (callback) {
      callback();
    }

    // Redirect to the new locale URL
    const currentPath = window.location.pathname;
    let newPath: string;

    if (currentPath.startsWith("/en/") || currentPath === "/en") {
      newPath = currentPath.replace(/^\/en/, `/${lng}`);
    } else if (currentPath.startsWith("/tr/") || currentPath === "/tr") {
      newPath = currentPath.replace(/^\/tr/, `/${lng}`);
    } else {
      newPath = `/${lng}${currentPath}`;
    }

    // Fallback to exactly /lng
    window.location.href = newPath || `/${lng}`;
  };

  return { language: i18n.language, changeLanguage };
};
