export const locales = ["en", "tr"];
export const defaultLocale = "en";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  verifyEmailNotice: "/verify-email-notice",
  dashboard: "/dashboard",
  profile: "/profile",
  logout: "/logout",
} as const;

/**
 * Returns a localized path for a given route.
 * Example: getLocalizedPath(ROUTES.login, "tr") -> "/tr/login"
 */
export const getLocalizedPath = (path: string, locale: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
};

// Routes that require authentication (without locale prefix)
export const protectedRoutes = [ROUTES.dashboard, ROUTES.profile, "/settings"];

// Routes that should NOT be accessible when logged in (without locale prefix)
export const authRoutes = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
];

// Public routes that should always be accessible (without locale prefix)
export const publicAuthRoutes = [ROUTES.verifyEmailNotice];

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

/**
 * Extracts the locale from a path if it exists, otherwise returns the default locale.
 */
export const getLocaleFromPath = (path: string): string => {
  const localePattern = new RegExp(`^/(${locales.join("|")})($|/)`);
  const match = localePattern.exec(path);
  return match ? match[1] : defaultLocale;
};
