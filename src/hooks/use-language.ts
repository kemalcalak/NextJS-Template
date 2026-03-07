"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = (lng: string, callback?: () => void) => {
    void i18n.changeLanguage(lng);
    document.cookie = `NEXT_LOCALE=${lng}; path=/; max-age=31536000; SameSite=Lax`;

    if (callback) {
      callback();
    }

    // Replace full reload with router.push
    const currentPath = window.location.pathname;
    let newPath: string;

    if (currentPath.startsWith("/en/") || currentPath === "/en") {
      newPath = currentPath.replace(/^\/en/, `/${lng}`);
    } else if (currentPath.startsWith("/tr/") || currentPath === "/tr") {
      newPath = currentPath.replace(/^\/tr/, `/${lng}`);
    } else {
      newPath = `/${lng}${currentPath}`;
    }

    router.push(newPath || `/${lng}`);
  };

  return { language: i18n.language, changeLanguage };
};
