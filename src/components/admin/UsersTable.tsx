"use client";

import {
  CheckCircle2,
  ChevronRight,
  KeyRound,
  MoreHorizontal,
  PauseCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { StatusBadge, UserStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES, getLocaleFromPath, getLocalizedPath } from "@/lib/config/routes";
import type { AdminUser } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};

interface UsersTableProps {
  rows: AdminUser[];
  isLoading: boolean;
  currentUserId: string | null;
  onActivate: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
  onReset: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export function UsersTable({
  rows,
  isLoading,
  currentUserId,
  onActivate,
  onDeactivate,
  onReset,
  onDelete,
}: UsersTableProps) {
  const { t } = useTranslation("admin");
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("users.columns.user")}</th>
            <th className="px-4 py-3">{t("users.columns.role")}</th>
            <th className="px-4 py-3">{t("users.columns.status")}</th>
            <th className="px-4 py-3">{t("users.columns.verified")}</th>
            <th className="px-4 py-3">{t("users.columns.created")}</th>
            <th className="px-4 py-3 text-right">{t("users.columns.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((user) => {
            const isSelf = currentUserId === user.id;
            return (
            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={getLocalizedPath(`${ROUTES.adminUsers}/${user.id}`, currentLocale)}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
                    {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-primary">
                      {user.first_name || user.last_name
                        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                        : user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge tone={user.role === SystemRole.ADMIN ? "primary" : "muted"}>
                  {t(`users.role.${user.role}` as const)}
                </StatusBadge>
              </td>
              <td className="px-4 py-3">
                <UserStatusBadge user={user} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {user.is_verified ? "✓" : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link
                      href={getLocalizedPath(`${ROUTES.adminUsers}/${user.id}`, currentLocale)}
                      aria-label={t("users.rowActions.open")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="row-actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {user.is_active ? (
                        <DropdownMenuItem
                          disabled={isSelf}
                          onSelect={() => {
                            onDeactivate(user);
                          }}
                        >
                          <PauseCircle className="mr-2 h-4 w-4" />
                          {t("users.rowActions.deactivate")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={() => {
                            onActivate(user);
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {t("users.rowActions.activate")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={() => {
                          onReset(user);
                        }}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        {t("users.rowActions.resetPassword")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={isSelf}
                        className="text-destructive focus:text-destructive"
                        onSelect={() => {
                          onDelete(user);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("users.rowActions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {isLoading ? t("users.loading") : t("users.empty")}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
