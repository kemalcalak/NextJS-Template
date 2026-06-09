"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminListItem } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

interface AdminRowProps {
  admin: AdminListItem;
  onManage: (admin: AdminListItem) => void;
  onDemote: (admin: AdminListItem) => void;
}

export function AdminRow({ admin, onManage, onDemote }: AdminRowProps) {
  const { t } = useTranslation("admin");
  const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ");
  const isSuperadmin = admin.role === SystemRole.SUPERADMIN;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{admin.email}</p>
          {fullName ? <p className="text-sm text-muted-foreground">{fullName}</p> : null}
        </div>

        {isSuperadmin ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {t("admins.superadminBadge")}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("admins.permissionCount", { count: admin.permissions.length })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onManage(admin);
              }}
            >
              {t("admins.managePermissions")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDemote(admin);
              }}
            >
              {t("admins.demote.action")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
