export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  verifyEmailNotice: "/verify-email-notice",
  accountDeactivated: "/account-deactivated",
  dashboard: "/dashboard",
  profile: "/profile",
  logout: "/logout",
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminActivities: "/admin/activities",
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
export const protectedRoutes = [
  ROUTES.dashboard,
  ROUTES.profile,
  ROUTES.adminDashboard,
  ROUTES.adminUsers,
  ROUTES.adminActivities,
];

// Routes that should NOT be accessible when logged in (without locale prefix)
export const authRoutes = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
  ROUTES.adminLogin,
];

// Public routes that should always be accessible (without locale prefix)
export const publicAuthRoutes = [ROUTES.verifyEmailNotice];

// Routes that require a valid session but MUST remain reachable when the
// account is in the deletion grace window. The protected-layout guard
// redirects deactivated users to these instead of the dashboard.
export const pendingDeletionRoutes = [ROUTES.accountDeactivated];

/**
 * Checks if a given path matches any of the routes in the list.
 * Matches exact paths or sub-paths (e.g., /dashboard matches /dashboard/profile).
 */
export const matchesRoute = (path: string, route: string) =>
  path === route || path.startsWith(`${route}/`);

// Routes that belong to the admin shell. The proxy uses this to redirect
// logged-in visitors of /admin/login to /admin/dashboard instead of the
// regular dashboard, and to send unauthenticated admin visitors back to
// /admin/login instead of the public login page.
export const adminRoutes = [
  ROUTES.adminLogin,
  ROUTES.adminDashboard,
  ROUTES.adminUsers,
  ROUTES.adminActivities,
];

export const isAdminPath = (path: string) => adminRoutes.some((route) => matchesRoute(path, route));

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
