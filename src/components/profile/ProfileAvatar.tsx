"use client";

import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FileUpload } from "@/components/common/file-upload";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateMe } from "@/hooks/api/use-users";
import type { FilePublic } from "@/lib/types/file";
import { useAuthStore } from "@/stores/auth.store";

export const ProfileAvatar = () => {
  const { t } = useTranslation("profile");
  const { user, setUser } = useAuthStore();
  const { mutate: updateMe } = useUpdateMe();

  const handleChange = (files: FilePublic[]) => {
    const avatar = files[0] ?? null;
    updateMe(
      { avatar_file_id: avatar?.id ?? null },
      {
        onSuccess: (updatedUser) => {
          setUser(updatedUser);
        },
      },
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          {t("avatar.title")}
        </CardTitle>
        <CardDescription>{t("avatar.description")}</CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <FileUpload
          value={user?.avatar_file ? [user.avatar_file] : []}
          onChange={handleChange}
          maxCount={1}
        />
      </div>
    </Card>
  );
};
