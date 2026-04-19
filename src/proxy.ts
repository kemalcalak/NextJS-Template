import { NextResponse } from "next/server";

import {
  locales,
  defaultLocale,
  protectedRoutes,
  authRoutes,
  publicAuthRoutes,
  matchesRoute,
  getLocaleFromPath,
  getPathWithoutLocale,
  isAdminPath,
  ROUTES,
  getLocalizedPath,
  type Locale,
} from "@/lib/config/routes";

import type { NextRequest } from "next/server";

interface RedirectDecisionInput {
  isProtectedRoute: boolean;
  isAuthRoute: boolean;
  hasToken: boolean;
  sessionExpired: boolean;
  underAdmin: boolean;
}

function resolveRedirectTarget({
  isProtectedRoute,
  isAuthRoute,
  hasToken,
  sessionExpired,
  underAdmin,
}: RedirectDecisionInput): string | null {
  if (isProtectedRoute && !hasToken) {
    return underAdmin ? ROUTES.adminLogin : ROUTES.login;
  }
  if (isAuthRoute && hasToken && !sessionExpired) {
    return underAdmin ? ROUTES.adminDashboard : ROUTES.dashboard;
  }
  return null;
}

function handleLocaleRedirect(request: NextRequest, pathname: string, search: string) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    cookieLocale && locales.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : defaultLocale;

  // IMPORTANT: Preserve search parameters (query string)
  const targetPath = `/${locale}${pathname === "/" ? "" : pathname}${search}`;
  const response = NextResponse.redirect(new URL(targetPath, request.url));

  // Save the locale to cookie for future requests
  response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 }); // 1 year
  return response;
}

function handleAuthGuard(request: NextRequest, pathname: string, token: string | undefined) {
  const currentLocale = getLocaleFromPath(pathname);
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // Home path is always public - explicit early return to avoid any redirect logic
  if (pathWithoutLocale === "/") {
    const localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value;
    const response = NextResponse.next();
    if (localeFromCookie !== currentLocale) {
      response.cookies.set("NEXT_LOCALE", currentLocale, { path: "/", maxAge: 31536000 });
    }
    return response;
  }

  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(pathWithoutLocale, route));
  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathWithoutLocale, route));
  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    matchesRoute(pathWithoutLocale, route),
  );

  // If it's a public auth route, always allow
  if (isPublicAuthRoute) {
    const localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value;
    const response = NextResponse.next();
    if (localeFromCookie !== currentLocale) {
      response.cookies.set("NEXT_LOCALE", currentLocale, { path: "/", maxAge: 31536000 });
    }
    return response;
  }

  const sessionExpired = request.nextUrl.searchParams.get("session_expired") === "true";
  const underAdmin = isAdminPath(pathWithoutLocale);
  const redirectTarget = resolveRedirectTarget({
    isProtectedRoute,
    isAuthRoute,
    hasToken: Boolean(token),
    sessionExpired,
    underAdmin,
  });

  // Admin routes send the user to /admin/login so the two login surfaces stay
  // separate (future-proof for an admin.<domain> split). Visitors of
  // /admin/login are sent to /admin/dashboard; the admin layout then verifies
  // the role and kicks non-admins back to /dashboard.
  const response = redirectTarget
    ? NextResponse.redirect(new URL(getLocalizedPath(redirectTarget, currentLocale), request.url))
    : NextResponse.next();

  // Ensure cookie is set correctly to persist locale choice
  const localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeFromCookie !== currentLocale) {
    response.cookies.set("NEXT_LOCALE", currentLocale, { path: "/", maxAge: 31536000 });
  }

  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // 1. Locale Routing Logic
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Redirect to localized path if needed
  if (!pathnameHasLocale) {
    return handleLocaleRedirect(request, pathname, search);
  }

  // 2. Auth Guard Logic
  return handleAuthGuard(request, pathname, token);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public folders like images)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|assets|favicon.ico).*)",
  ],
};
