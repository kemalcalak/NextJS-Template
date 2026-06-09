"use client";

import { useState, type ReactNode } from "react";

import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdmins,
  useDeleteAdmin,
  useDemoteSuperadmin,
  usePermissionCatalog,
  usePromoteSuperadmin,
} from "@/hooks/api/use-admin";
import { useIsRootSuperadmin, useIsSuperadmin } from "@/hooks/usePermissions";
import type { AdminListItem } from "@/lib/types/admin";

import { AdminForbidden } from "../AdminForbidden";
import { AdminRow } from "./AdminRow";
import { CreateAdminModal } from "./CreateAdminModal";
import { EditPermissionsModal } from "./EditPermissionsModal";

type AdminActionKind = "delete" | "promote" | "demote";

interface AdminActionState {
  kind: AdminActionKind;
  admin: AdminListItem;
}

interface AdminAction {
  i18n: string;
  destructive: boolean;
  isPending: boolean;
  run: (id: string, onDone: () => void) => void;
}

export function AdminsContent() {
  const { t } = useTranslation("admin");
  const isSuperadmin = useIsSuperadmin();
  const isRoot = useIsRootSuperadmin();
  const adminsQuery = useAdmins(isSuperadmin);
  const catalogQuery = usePermissionCatalog(isSuperadmin);
  const deleteMutation = useDeleteAdmin();
  const promoteMutation = usePromoteSuperadmin();
  const demoteMutation = useDemoteSuperadmin();

  const [editing, setEditing] = useState<AdminListItem | null>(null);
  const [action, setAction] = useState<AdminActionState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (!isSuperadmin) return <AdminForbidden />;

  const catalog = catalogQuery.data?.permissions ?? [];
  const admins = adminsQuery.data?.data ?? [];
  const isLoading = adminsQuery.isLoading || catalogQuery.isLoading;

  // One dialog drives all three superadmin-tier confirmations. Each kind maps to
  // its i18n block, destructive styling, and the mutation that performs it.
  const actions: Record<AdminActionKind, AdminAction> = {
    delete: {
      i18n: "delete",
      destructive: true,
      isPending: deleteMutation.isPending,
      run: (id, onDone) => {
        deleteMutation.mutate(id, { onSuccess: onDone });
      },
    },
    promote: {
      i18n: "promoteSuperadmin",
      destructive: false,
      isPending: promoteMutation.isPending,
      run: (id, onDone) => {
        promoteMutation.mutate(id, { onSuccess: onDone });
      },
    },
    demote: {
      i18n: "demoteToAdmin",
      destructive: true,
      isPending: demoteMutation.isPending,
      run: (id, onDone) => {
        demoteMutation.mutate(id, { onSuccess: onDone });
      },
    },
  };
  const active = action ? actions[action.kind] : null;

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
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        title={active ? t(`admins.${active.i18n}.title`) : ""}
        description={
          action && active
            ? t(`admins.${active.i18n}.description`, { email: action.admin.email })
            : ""
        }
        confirmLabel={active ? t(`admins.${active.i18n}.confirm`) : ""}
        cancelLabel={active ? t(`admins.${active.i18n}.cancel`) : ""}
        destructive={active?.destructive ?? false}
        isLoading={active?.isPending ?? false}
        onConfirm={() => {
          if (!action || !active) return;
          active.run(action.admin.id, () => {
            setAction(null);
          });
        }}
      />
    </div>
  );
}
