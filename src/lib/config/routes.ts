export const locales = ["en", "tr"];
export const defaultLocale = "en";

// Routes that require authentication (without locale prefix)
export const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Routes that should NOT be accessible when logged in (without locale prefix)
export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Public routes that should always be accessible (without locale prefix)
export const publicAuthRoutes = ["/verify-email-notice"];

/**
 * Checks if a given path matches any of the routes in the list.
 * Matches exact paths or sub-paths (e.g., /dashboard matches /dashboard/profile).
 */
export const matchesRoute = (path: string, route: string) =>
  path === route || path.startsWith(`${route}/`);

/**
 * Removes the locale prefix from a path if it exists.
 */
export const getPathWithoutLocale = (path: string): string => {
  const localePattern = new RegExp(`^/(${locales.join("|")})($|/)`);
  return path.replace(localePattern, "$2") || "/";
};
