import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const locales = ["en", "tr"];
const defaultLocale = "en";

// Routes that require authentication (without locale prefix)
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
// Routes that should NOT be accessible when logged in (without locale prefix)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
// Public routes that should always be accessible (without locale prefix)
const publicAuthRoutes = ["/verify-email-notice"];

function handleLocaleRedirect(request: NextRequest, pathname: string, search: string) {
  let locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!locale || !locales.includes(locale)) {
    const acceptLang = request.headers.get("accept-language");
    locale = acceptLang?.includes("tr") ? "tr" : defaultLocale;
  }

  // IMPORTANT: Preserve search parameters (query string)
  const targetPath = `/${locale}${pathname === "/" ? "" : pathname}${search}`;
  return NextResponse.redirect(new URL(targetPath, request.url));
}

function handleAuthGuard(request: NextRequest, pathname: string, token: string | undefined) {
  const localePrefixMatch = /^\/(en|tr)(\/|$)/.exec(pathname);
  const currentLocale = localePrefixMatch ? localePrefixMatch[1] : defaultLocale;
  const pathWithoutLocale = pathname.replace(/^\/(en|tr)/, "") || "/";

  const matchesRoute = (path: string, route: string) =>
    path === route || path.startsWith(`${route}/`);

  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(pathWithoutLocale, route));
  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathWithoutLocale, route));
  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    matchesRoute(pathWithoutLocale, route),
  );

  // If it's a public auth route like verify-email-notice, always allow
  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  // If not logged in and onto a protected route -> redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and onto an auth route -> redirect to dashboard
  if (isAuthRoute && token) {
    // We allow navigation but we could also redirect to dashboard
    // To avoid loops where token is invalid but still in cookie, we'll keep it simple
    return NextResponse.next();
  }

  return NextResponse.next();
}

export function proxy(request: NextRequest) {
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
