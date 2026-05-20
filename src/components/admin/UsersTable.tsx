"use client";

import { Dropdown, type MenuProps } from "antd";
import { Ban, ChevronRight, KeyRound, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { StatusBadge, UserStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import type { UserActionKind } from "@/hooks/api/use-user-actions";
import { ROUTES, getLocaleFromPath, getLocalizedPath } from "@/lib/config/routes";
import { formatDate } from "@/lib/format-date";
import type { AdminUser } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

interface UsersTableProps {
  rows: AdminUser[];
  isLoading: boolean;
  currentUserId: string | null;
  onAction: (kind: UserActionKind, user: AdminUser) => void;
}

const buildRowMenu = (
  user: AdminUser,
  isSelf: boolean,
  onAction: UsersTableProps["onAction"],
  t: (key: string) => string,
): MenuProps["items"] => [
  user.suspended_at
    ? {
        key: "unsuspend",
        icon: <RotateCcw className="h-4 w-4" />,
        label: t("users.rowActions.unsuspend"),
        onClick: () => {
          onAction("unsuspend", user);
        },
      }
    : {
        key: "suspend",
        icon: <Ban className="h-4 w-4" />,
        label: t("users.rowActions.suspend"),
        danger: true,
        disabled: isSelf,
        onClick: () => {
          onAction("suspend", user);
        },
      },
  {
    key: "change-password",
    icon: <KeyRound className="h-4 w-4" />,
    label: t("users.rowActions.changePassword"),
    onClick: () => {
      onAction("change-password", user);
    },
  },
  { type: "divider" },
  {
    key: "delete",
    icon: <Trash2 className="h-4 w-4" />,
    label: t("users.rowActions.delete"),
    danger: true,
    disabled: isSelf,
    onClick: () => {
      onAction("delete", user);
    },
  },
];

export function UsersTable({ rows, isLoading, currentUserId, onAction }: UsersTableProps) {
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
                    <Dropdown
                      menu={{ items: buildRowMenu(user, isSelf, onAction, t) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("users.rowActions.menu")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </span>
                    </Dropdown>
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
