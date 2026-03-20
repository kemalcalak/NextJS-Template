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
  ROUTES,
  getLocalizedPath,
} from "@/lib/config/routes";

import type { NextRequest } from "next/server";

function handleLocaleRedirect(request: NextRequest, pathname: string, search: string) {
  let locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!locale || !locales.includes(locale)) {
    // Priority: Cookie > Default Locale
    // We skip accept-language to ensure predictable behavior for first-time visitors and tests
    locale = defaultLocale;
  }

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

  let response: NextResponse | null = null;

  // If not logged in and onto a protected route -> redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(getLocalizedPath(ROUTES.login, currentLocale), request.url);
    response = NextResponse.redirect(loginUrl);
  }

  // If logged in and onto an auth route -> redirect to dashboard
  else if (isAuthRoute && token) {
    const dashboardUrl = new URL(getLocalizedPath(ROUTES.dashboard, currentLocale), request.url);
    response = NextResponse.redirect(dashboardUrl);
  }

  // Default: proceed to the page
  if (!response) {
    response = NextResponse.next();
  }

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
