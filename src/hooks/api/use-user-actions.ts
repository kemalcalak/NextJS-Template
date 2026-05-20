import { useTranslation } from "react-i18next";

import {
  useChangeAdminUserPassword,
  useDeleteAdminUser,
  useSuspendAdminUser,
  useUnsuspendAdminUser,
} from "@/hooks/api/use-admin";
import type { AdminUser } from "@/lib/types/admin";

export type UserActionKind = "suspend" | "unsuspend" | "delete" | "change-password";

interface RunOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

export function useUserActions() {
  const { i18n } = useTranslation();
  const suspend = useSuspendAdminUser();
  const unsuspend = useUnsuspendAdminUser();
  const remove = useDeleteAdminUser();
  const changePassword = useChangeAdminUserPassword();

  const run = (kind: UserActionKind, user: AdminUser, opts?: RunOptions) => {
    switch (kind) {
      case "suspend":
        suspend.mutate(user.id, opts);
        return;
      case "unsuspend":
        unsuspend.mutate(user.id, opts);
        return;
      case "delete":
        remove.mutate(user.id, opts);
        return;
      case "change-password":
        changePassword.mutate({ id: user.id, lang: i18n.language }, opts);
        return;
    }
  };

  const isLoading =
    suspend.isPending || unsuspend.isPending || remove.isPending || changePassword.isPending;

  return { run, isLoading };
}
