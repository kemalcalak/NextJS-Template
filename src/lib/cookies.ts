/**
 * Simple cookie helper functions
 * (Currently not used for authentication as we shifted to HttpOnly cookies)
 */

export const setCookie = (name: string, value: string, days?: number) => {
  if (typeof window === "undefined") return;

  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};

export const eraseCookie = (name: string) => {
  if (typeof window === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};
