"use client";

import { Ban, KeyRound, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserActionKind } from "@/hooks/api/use-user-actions";
import type { AdminUser } from "@/lib/types/admin";

interface UserDangerZoneProps {
  user: AdminUser;
  isSelf: boolean;
  disabled: boolean;
  onAction: (kind: UserActionKind) => void;
}

export function UserDangerZone({ user, isSelf, disabled, onAction }: UserDangerZoneProps) {
  const { t } = useTranslation("admin");

  return (
    <Card data-testid="admin-user-danger-zone" className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base text-destructive">{t("userDetail.dangerTitle")}</CardTitle>
        <CardDescription>{t("userDetail.dangerDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            onAction("reset");
          }}
          disabled={disabled}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          {t("userDetail.resetPassword")}
        </Button>
        {user.suspended_at ? (
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
        )}
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
      </CardContent>
    </Card>
  );
}
