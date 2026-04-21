"use client";

import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { UserActionKind } from "@/hooks/api/use-user-actions";

export type { UserActionKind };

interface UserActionDialogsProps {
  action: UserActionKind | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

// Centralises the four confirm dialogs used by the users list + detail pages
// so both surfaces share the same copy and behavior.
export function UserActionDialogs({
  action,
  onOpenChange,
  onConfirm,
  isLoading,
}: UserActionDialogsProps) {
  const { t } = useTranslation("admin");

  return (
    <>
      <ConfirmDialog
        open={action === "unsuspend"}
        onOpenChange={onOpenChange}
        title={t("confirm.unsuspendTitle")}
        description={t("confirm.unsuspendDescription")}
        confirmLabel={t("confirm.unsuspendConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
      />
      <ConfirmDialog
        open={action === "suspend"}
        onOpenChange={onOpenChange}
        title={t("confirm.suspendTitle")}
        description={t("confirm.suspendDescription")}
        confirmLabel={t("confirm.suspendConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
        destructive
      />
      <ConfirmDialog
        open={action === "reset"}
        onOpenChange={onOpenChange}
        title={t("confirm.resetTitle")}
        description={t("confirm.resetDescription")}
        confirmLabel={t("confirm.resetConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
      />
      <ConfirmDialog
        open={action === "delete"}
        onOpenChange={onOpenChange}
        title={t("confirm.deleteTitle")}
        description={t("confirm.deleteDescription")}
        confirmLabel={t("confirm.deleteConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
        destructive
      />
    </>
  );
}
