"use client";

import { Dropdown, type MenuProps } from "antd";
import { KeyRound, MoreHorizontal, ShieldMinus, ShieldPlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  AdminTable,
  AdminTableStateRow,
  AdminTbody,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { AdminListItem } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

interface AdminsTableProps {
  rows: AdminListItem[];
  isLoading: boolean;
  // Whether the current viewer is the root superadmin — gates the
  // superadmin-tier actions (promote to superadmin, demote back to admin).
  isViewerRoot: boolean;
  onManage: (admin: AdminListItem) => void;
  onDelete: (admin: AdminListItem) => void;
  onPromote: (admin: AdminListItem) => void;
  onDemoteSuperadmin: (admin: AdminListItem) => void;
}

interface RowMenuArgs {
  admin: AdminListItem;
  isViewerRoot: boolean;
  t: (key: string) => string;
  onManage: AdminsTableProps["onManage"];
  onDelete: AdminsTableProps["onDelete"];
  onPromote: AdminsTableProps["onPromote"];
  onDemoteSuperadmin: AdminsTableProps["onDemoteSuperadmin"];
}

// Build only the actions the viewer may perform on this row. The root
// superadmin row gets no menu at all — its role only changes via root transfer.
const buildRowMenu = ({
  admin,
  isViewerRoot,
  t,
  onManage,
  onDelete,
  onPromote,
  onDemoteSuperadmin,
}: RowMenuArgs): MenuProps["items"] => {
  if (admin.role === SystemRole.SUPERADMIN) {
    if (!isViewerRoot || admin.is_root_superadmin) return [];
    return [
      {
        key: "demote",
        icon: <ShieldMinus className="h-4 w-4" />,
        label: t("admins.demoteToAdmin.action"),
        onClick: () => {
          onDemoteSuperadmin(admin);
        },
      },
    ];
  }

  const items: NonNullable<MenuProps["items"]> = [
    {
      key: "manage-permissions",
      icon: <KeyRound className="h-4 w-4" />,
      label: t("admins.managePermissions"),
      onClick: () => {
        onManage(admin);
      },
    },
  ];

  if (isViewerRoot) {
    items.push({
      key: "promote",
      icon: <ShieldPlus className="h-4 w-4" />,
      label: t("admins.promoteSuperadmin.action"),
      onClick: () => {
        onPromote(admin);
      },
    });
  }

  items.push(
    { type: "divider" },
    {
      key: "delete",
      icon: <Trash2 className="h-4 w-4" />,
      label: t("admins.delete.action"),
      danger: true,
      onClick: () => {
        onDelete(admin);
      },
    },
  );

  return items;
};

export function AdminsTable({
  rows,
  isLoading,
  isViewerRoot,
  onManage,
  onDelete,
  onPromote,
  onDemoteSuperadmin,
}: AdminsTableProps) {
  const { t } = useTranslation("admin");

  return (
    <AdminTable>
      <AdminThead>
        <AdminTh className="text-start">{t("admins.columns.admin")}</AdminTh>
        <AdminTh className="text-center">{t("admins.columns.role")}</AdminTh>
        <AdminTh className="text-center">{t("admins.columns.permissions")}</AdminTh>
        <AdminTh className="text-center">{t("admins.columns.created")}</AdminTh>
        <AdminTh className="text-right">{t("admins.columns.actions")}</AdminTh>
      </AdminThead>
      <AdminTbody>
        {rows.map((admin) => {
          const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ");
          const isSuperadmin = admin.role === SystemRole.SUPERADMIN;
          const menuItems = buildRowMenu({
            admin,
            isViewerRoot,
            t,
            onManage,
            onDelete,
            onPromote,
            onDemoteSuperadmin,
          });

          return (
            <AdminTr key={admin.id}>
              <AdminTd className="text-start">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs uppercase">
                      {(admin.first_name?.[0] ?? admin.email[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fullName || admin.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
              </AdminTd>
              <AdminTd className="text-center">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {admin.is_root_superadmin ? (
                    <StatusBadge tone="warning">{t("admins.rootBadge")}</StatusBadge>
                  ) : null}
                  <StatusBadge tone={isSuperadmin ? "primary" : "info"}>
                    {t(`users.role.${admin.role}` as const)}
                  </StatusBadge>
                </div>
              </AdminTd>
              <AdminTd className="text-center text-xs text-muted-foreground">
                {admin.permissions.length}
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-center text-xs text-muted-foreground">
                {formatDate(admin.created_at)}
              </AdminTd>
              <AdminTd className="text-right">
                {menuItems && menuItems.length > 0 ? (
                  <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
                    <span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("admins.rowActions.menu")}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </span>
                  </Dropdown>
                ) : null}
              </AdminTd>
            </AdminTr>
          );
        })}
        {rows.length === 0 ? (
          <AdminTableStateRow
            colSpan={5}
            isLoading={isLoading}
            loadingLabel={t("admins.loading")}
            emptyLabel={t("admins.empty")}
          />
        ) : null}
      </AdminTbody>
    </AdminTable>
  );
}
