"use client";

import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export type UserActionKind = "activate" | "deactivate" | "reset" | "delete" | null;

interface UserActionDialogsProps {
  action: UserActionKind;
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
        open={action === "activate"}
        onOpenChange={onOpenChange}
        title={t("confirm.activateTitle")}
        description={t("confirm.activateDescription")}
        confirmLabel={t("confirm.activateConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
      />
      <ConfirmDialog
        open={action === "deactivate"}
        onOpenChange={onOpenChange}
        title={t("confirm.deactivateTitle")}
        description={t("confirm.deactivateDescription")}
        confirmLabel={t("confirm.deactivateConfirm")}
        cancelLabel={t("confirm.cancel")}
        onConfirm={onConfirm}
        isLoading={isLoading}
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
