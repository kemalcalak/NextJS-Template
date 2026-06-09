"use client";

import { useState, type ReactNode } from "react";

import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmins, useDemoteAdmin, usePermissionCatalog } from "@/hooks/api/use-admin";
import { useIsSuperadmin } from "@/hooks/usePermissions";
import type { AdminListItem } from "@/lib/types/admin";

import { AdminForbidden } from "../AdminForbidden";
import { AdminRow } from "./AdminRow";
import { CreateAdminModal } from "./CreateAdminModal";
import { EditPermissionsModal } from "./EditPermissionsModal";

export function AdminsContent() {
  const { t } = useTranslation("admin");
  const isSuperadmin = useIsSuperadmin();
  const adminsQuery = useAdmins(isSuperadmin);
  const catalogQuery = usePermissionCatalog(isSuperadmin);
  const demoteMutation = useDemoteAdmin();

  const [editing, setEditing] = useState<AdminListItem | null>(null);
  const [demoting, setDemoting] = useState<AdminListItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (!isSuperadmin) return <AdminForbidden />;

  const catalog = catalogQuery.data?.permissions ?? [];
  const admins = adminsQuery.data?.data ?? [];
  const isLoading = adminsQuery.isLoading || catalogQuery.isLoading;

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
          <AdminRow key={admin.id} admin={admin} onManage={setEditing} onDemote={setDemoting} />
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
        <Button
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          {t("admins.create.action")}
        </Button>
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

      <ConfirmDialog
        open={demoting !== null}
        onOpenChange={(open) => {
          if (!open) setDemoting(null);
        }}
        title={t("admins.demote.title")}
        description={demoting ? t("admins.demote.description", { email: demoting.email }) : ""}
        confirmLabel={t("admins.demote.confirm")}
        cancelLabel={t("admins.demote.cancel")}
        destructive
        isLoading={demoteMutation.isPending}
        onConfirm={() => {
          if (!demoting) return;
          demoteMutation.mutate(demoting.id, {
            onSuccess: () => {
              setDemoting(null);
            },
          });
        }}
      />
    </div>
  );
}
