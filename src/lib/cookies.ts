/**
 * Simple cookie helper functions
 */

export const setCookie = (name: string, value: string, days?: number) => {
  if (typeof window === "undefined") return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  // path=/ ensures cookie is valid for all routes
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
};

export const eraseCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
};
