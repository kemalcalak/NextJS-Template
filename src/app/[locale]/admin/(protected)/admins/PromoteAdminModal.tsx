"use client";

import { useState } from "react";

import { Modal } from "antd";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePromoteAdmin } from "@/hooks/api/use-admin";
import { adminApi } from "@/lib/api/endpoints/admin";
import type { Permission } from "@/lib/types/permissions";

import { PermissionMatrix } from "./PermissionMatrix";

interface PromoteAdminModalProps {
  catalog: Permission[];
  open: boolean;
  onClose: () => void;
}

function PromoteAdminBody({ catalog, onClose }: { catalog: Permission[]; onClose: () => void }) {
  const { t } = useTranslation("admin");
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const promoteMutation = usePromoteAdmin();

  const handlePromote = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) return;

    // Resolve the user id from the typed email via the existing admin search.
    const matches = await adminApi.listUsers({ search: trimmed, limit: 50 });
    const target = matches.data.find(
      (candidate) => candidate.email.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!target) {
      setError(t("admins.promote.notFound"));
      return;
    }

    promoteMutation.mutate({ user_id: target.id, permissions }, { onSuccess: onClose });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="promote-email">{t("admins.promote.emailLabel")}</Label>
        <Input
          id="promote-email"
          type="email"
          value={email}
          placeholder={t("admins.promote.emailPlaceholder")}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <PermissionMatrix
        catalog={catalog}
        value={permissions}
        onChange={setPermissions}
        disabled={promoteMutation.isPending}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={promoteMutation.isPending}>
          {t("admins.modal.cancel")}
        </Button>
        <Button
          disabled={!email.trim() || promoteMutation.isPending}
          onClick={() => {
            void handlePromote();
          }}
        >
          {t("admins.promote.action")}
        </Button>
      </div>
    </div>
  );
}

export function PromoteAdminModal({ catalog, open, onClose }: PromoteAdminModalProps) {
  const { t } = useTranslation("admin");
  return (
    <Modal
      open={open}
      title={t("admins.promote.title")}
      centered
      footer={null}
      width={560}
      destroyOnHidden
      onCancel={onClose}
    >
      <PromoteAdminBody catalog={catalog} onClose={onClose} />
    </Modal>
  );
}
