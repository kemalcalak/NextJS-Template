"use client";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AvatarUpload } from "@/components/common/file-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateAdminUser } from "@/hooks/api/use-admin";
import type { AdminUser } from "@/lib/types/admin";
import type { FilePublic } from "@/lib/types/file";

interface UserAvatarCardProps {
  user: AdminUser;
}

// Admin-side avatar editor for a target user. Setting/replacing applies
// immediately; removing is destructive (the backend purges the file from
// Cloudinary + DB), so it is confirmed via a modal first. The detail cache
// update from useUpdateAdminUser refreshes the header avatar.
export function UserAvatarCard({ user }: UserAvatarCardProps) {
  const { t } = useTranslation("admin");
  const update = useUpdateAdminUser();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleChange = (file: FilePublic | null) => {
    if (file === null) {
      setConfirmRemove(true);
      return;
    }
    update.mutate({ id: user.id, payload: { avatar_file_id: file.id } });
  };

  const confirmRemoval = () => {
    update.mutate(
      { id: user.id, payload: { avatar_file_id: null } },
      {
        onSuccess: () => {
          setConfirmRemove(false);
        },
      },
    );
  };

  return (
    <>
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">{t("userDetail.avatarTitle")}</CardTitle>
          <CardDescription>{t("userDetail.avatarDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            value={user.avatar_file ?? null}
            onChange={handleChange}
            disabled={update.isPending}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={(open) => {
          if (!open) setConfirmRemove(false);
        }}
        title={t("userDetail.removeAvatarTitle")}
        description={t("userDetail.removeAvatarDescription")}
        confirmLabel={t("userDetail.removeAvatarConfirm")}
        cancelLabel={t("userDetail.cancel")}
        onConfirm={confirmRemoval}
        isLoading={update.isPending}
        destructive
      />
    </>
  );
}
