import { useTranslation } from "react-i18next";

import {
  useActivateAdminUser,
  useDeactivateAdminUser,
  useDeleteAdminUser,
  useResetAdminUserPassword,
} from "@/hooks/api/use-admin";
import type { AdminUser } from "@/lib/types/admin";

export type UserActionKind = "activate" | "deactivate" | "delete" | "reset";

interface RunOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

export function useUserActions() {
  const { i18n } = useTranslation();
  const activate = useActivateAdminUser();
  const deactivate = useDeactivateAdminUser();
  const remove = useDeleteAdminUser();
  const resetPassword = useResetAdminUserPassword();

  const run = (kind: UserActionKind, user: AdminUser, opts?: RunOptions) => {
    switch (kind) {
      case "activate":
        activate.mutate(user.id, opts);
        return;
      case "deactivate":
        deactivate.mutate(user.id, opts);
        return;
      case "delete":
        remove.mutate(user.id, opts);
        return;
      case "reset":
        resetPassword.mutate({ id: user.id, lang: i18n.language }, opts);
        return;
    }
  };

  const isLoading =
    activate.isPending || deactivate.isPending || remove.isPending || resetPassword.isPending;

  return { run, isLoading };
}
