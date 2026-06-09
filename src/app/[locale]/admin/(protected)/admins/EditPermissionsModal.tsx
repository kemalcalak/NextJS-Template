"use client";

import { useState } from "react";

import { Modal } from "antd";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useSetAdminPermissions } from "@/hooks/api/use-admin";
import type { AdminListItem } from "@/lib/types/admin";
import type { Permission } from "@/lib/types/permissions";

import { PermissionMatrix } from "./PermissionMatrix";

interface EditPermissionsModalProps {
  admin: AdminListItem | null;
  catalog: Permission[];
  open: boolean;
  onClose: () => void;
}

// Body is a child so `destroyOnHidden` remounts it per open — the matrix state
// then re-initialises from the selected admin's grants without a sync effect.
function EditPermissionsBody({
  admin,
  catalog,
  onClose,
}: {
  admin: AdminListItem;
  catalog: Permission[];
  onClose: () => void;
}) {
  const { t } = useTranslation("admin");
  const [permissions, setPermissions] = useState<Permission[]>(admin.permissions);
  const setPermsMutation = useSetAdminPermissions();

  return (
    <div className="space-y-4">
      <PermissionMatrix
        catalog={catalog}
        value={permissions}
        onChange={setPermissions}
        disabled={setPermsMutation.isPending}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={setPermsMutation.isPending}>
          {t("admins.modal.cancel")}
        </Button>
        <Button
          disabled={setPermsMutation.isPending}
          onClick={() => {
            setPermsMutation.mutate(
              { id: admin.id, payload: { permissions } },
              { onSuccess: onClose },
            );
          }}
        >
          {t("admins.savePermissions")}
        </Button>
      </div>
    </div>
  );
}

export function EditPermissionsModal({ admin, catalog, open, onClose }: EditPermissionsModalProps) {
  const { t } = useTranslation("admin");
  return (
    <Modal
      open={open}
      title={admin ? t("admins.modal.title", { email: admin.email }) : ""}
      centered
      footer={null}
      width={560}
      destroyOnHidden
      onCancel={onClose}
    >
      {admin ? <EditPermissionsBody admin={admin} catalog={catalog} onClose={onClose} /> : null}
    </Modal>
  );
}
