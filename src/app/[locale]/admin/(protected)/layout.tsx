import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ROUTES, getLocalizedPath } from "@/lib/config/routes";

import { AdminShell } from "./AdminShell";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Server-side cookie gate for the admin area. The proxy already performs
// this redirect for us, but repeating it here matches the public (protected)
// layout's "defense in depth" pattern and keeps SSR honest. The role check
// (admin vs. plain user) lives in the client AdminShell since we need the
// /users/me payload for that — the cookie itself doesn't carry the role.
export default async function AdminProtectedLayout({
  children,
  params,
}: AdminProtectedLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect(getLocalizedPath(ROUTES.adminLogin, locale));
  }

  return <AdminShell>{children}</AdminShell>;
}
