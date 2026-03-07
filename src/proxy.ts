import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const locales = ["en", "tr"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if it's already a localized path
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Check cookie
  let locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!locale || !locales.includes(locale)) {
    // Check accept-language header
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang?.includes("tr")) {
      locale = "tr";
    } else {
      locale = defaultLocale;
    }
  }

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip static files, api routes, Next.js internals
    "/((?!api|_next/static|_next/image|assets|favicon.ico).*)",
  ],
};
