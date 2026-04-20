import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { SystemRole, type User } from "@/lib/types/user";

import { AdminShell } from "./AdminShell";

interface AdminProtectedLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

// Reuse /users/me rather than adding a dedicated me-role endpoint: the server
// round-trip happens once per admin navigation and the response is cheap.
const fetchCurrentUser = async (token: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/users/me`, {
      headers: {
        cookie: `access_token=${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
};

// Server-side defense-in-depth for the admin area. The proxy/backend already
// enforce role on API calls; this layer keeps non-admins from receiving the
// admin HTML + JS bundle at all when the backend is reachable. If the
// server-to-server /users/me call fails (backend offline, E2E with no real
// API, network blip) we fall through: AdminShell's client-side check and the
// backend's per-request role check both still hold the line.
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

  const user = await fetchCurrentUser(token);
  if (user && user.role !== SystemRole.ADMIN) {
    redirect(getLocalizedPath(ROUTES.dashboard, locale));
  }

  return <AdminShell>{children}</AdminShell>;
}
