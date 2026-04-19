"use client";

import { CheckCircle2, KeyRound, PauseCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUser } from "@/lib/types/admin";

interface UserDangerZoneProps {
  user: AdminUser;
  isSelf: boolean;
  disabled: boolean;
  onReset: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function UserDangerZone({
  user,
  isSelf,
  disabled,
  onReset,
  onActivate,
  onDeactivate,
  onDelete,
}: UserDangerZoneProps) {
  const { t } = useTranslation("admin");

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base text-destructive">{t("userDetail.dangerTitle")}</CardTitle>
        <CardDescription>{t("userDetail.dangerDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onReset} disabled={disabled}>
          <KeyRound className="mr-2 h-4 w-4" />
          {t("userDetail.resetPassword")}
        </Button>
        {user.is_active ? (
          <Button variant="outline" onClick={onDeactivate} disabled={disabled || isSelf}>
            <PauseCircle className="mr-2 h-4 w-4" />
            {t("userDetail.deactivate")}
          </Button>
        ) : (
          <Button variant="outline" onClick={onActivate} disabled={disabled}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t("userDetail.activate")}
          </Button>
        )}
        <Button variant="destructive" onClick={onDelete} disabled={disabled || isSelf}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t("userDetail.delete")}
        </Button>
      </CardContent>
    </Card>
  );
}
