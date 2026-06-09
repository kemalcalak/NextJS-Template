"use client";

import { Ban, KeyRound, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserActionKind } from "@/hooks/api/use-user-actions";
import type { AdminUser } from "@/lib/types/admin";

interface UserDangerZoneCaps {
  canResetPassword: boolean;
  canSuspend: boolean;
  canDelete: boolean;
}

interface UserDangerZoneProps {
  user: AdminUser;
  isSelf: boolean;
  disabled: boolean;
  caps: UserDangerZoneCaps;
  onAction: (kind: UserActionKind) => void;
}

export function UserDangerZone({ user, isSelf, disabled, caps, onAction }: UserDangerZoneProps) {
  const { t } = useTranslation("admin");

  // Nothing destructive is permitted — omit the section entirely rather than
  // showing disabled buttons that would never fire a request.
  if (!caps.canResetPassword && !caps.canSuspend && !caps.canDelete) {
    return null;
  }

  return (
    <Card data-testid="admin-user-danger-zone" className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base text-destructive">{t("userDetail.dangerTitle")}</CardTitle>
        <CardDescription>{t("userDetail.dangerDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {caps.canResetPassword ? (
          <Button
            variant="outline"
            onClick={() => {
              onAction("change-password");
            }}
            disabled={disabled}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {t("userDetail.changePassword")}
          </Button>
        ) : null}
        {caps.canSuspend &&
          (user.suspended_at ? (
            <Button
              variant="outline"
              onClick={() => {
                onAction("unsuspend");
              }}
              disabled={disabled}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("userDetail.unsuspend")}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                onAction("suspend");
              }}
              disabled={disabled || isSelf}
            >
              <Ban className="mr-2 h-4 w-4" />
              {t("userDetail.suspend")}
            </Button>
          ))}
        {caps.canDelete ? (
          <Button
            variant="destructive"
            onClick={() => {
              onAction("delete");
            }}
            disabled={disabled || isSelf}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("userDetail.delete")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
