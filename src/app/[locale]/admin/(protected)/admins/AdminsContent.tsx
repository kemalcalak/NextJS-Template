"use client";

import { useState, type ReactNode } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmins, usePermissionCatalog } from "@/hooks/api/use-admin";
import { useIsRootSuperadmin, useIsSuperadmin } from "@/hooks/usePermissions";
import type { AdminListItem } from "@/lib/types/admin";
import { SystemRole } from "@/lib/types/user";

import { AdminForbidden } from "../AdminForbidden";
import { AdminActionConfirm, type AdminActionState } from "./AdminActionConfirm";
import { AdminRow } from "./AdminRow";
import { CreateAdminModal } from "./CreateAdminModal";
import { EditPermissionsModal } from "./EditPermissionsModal";
import { TransferRootModal } from "./TransferRootModal";

export function AdminsContent() {
  const { t } = useTranslation("admin");
  const isSuperadmin = useIsSuperadmin();
  const isRoot = useIsRootSuperadmin();
  const adminsQuery = useAdmins(isSuperadmin);
  const catalogQuery = usePermissionCatalog(isSuperadmin);

  const [editing, setEditing] = useState<AdminListItem | null>(null);
  const [action, setAction] = useState<AdminActionState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  if (!isSuperadmin) return <AdminForbidden />;

  const catalog = catalogQuery.data?.permissions ?? [];
  const admins = adminsQuery.data?.data ?? [];
  const isLoading = adminsQuery.isLoading || catalogQuery.isLoading;
  // Root can only be transferred to another (non-root) superadmin.
  const transferTargets = admins.filter(
    (entry) => entry.role === SystemRole.SUPERADMIN && !entry.is_root_superadmin,
  );

  let listContent: ReactNode;
  if (isLoading) {
    listContent = (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  } else if (admins.length === 0) {
    listContent = (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          {t("admins.empty")}
        </CardContent>
      </Card>
    );
  } else {
    listContent = (
      <div className="space-y-3">
        {admins.map((admin) => (
          <AdminRow
            key={admin.id}
            admin={admin}
            isViewerRoot={isRoot}
            onManage={setEditing}
            onDelete={(target) => {
              setAction({ kind: "delete", admin: target });
            }}
            onPromote={(target) => {
              setAction({ kind: "promote", admin: target });
            }}
            onDemoteSuperadmin={(target) => {
              setAction({ kind: "demote", admin: target });
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("admins.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admins.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isRoot ? (
            <Button
              variant="outline"
              onClick={() => {
                setTransferOpen(true);
              }}
            >
              {t("admins.transferRoot.action")}
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            {t("admins.create.action")}
          </Button>
        </div>
      </div>

      {listContent}

      <EditPermissionsModal
        admin={editing}
        catalog={catalog}
        open={editing !== null}
        onClose={() => {
          setEditing(null);
        }}
      />

      <CreateAdminModal
        catalog={catalog}
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
      />

      <TransferRootModal
        targets={transferTargets}
        open={transferOpen}
        onClose={() => {
          setTransferOpen(false);
        }}
      />

      <AdminActionConfirm
        action={action}
        onClose={() => {
          setAction(null);
        }}
      />
    </div>
  );
}
