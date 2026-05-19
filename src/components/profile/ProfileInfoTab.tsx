"use client";

import { useState } from "react";

import { Form } from "antd";
import { User, Edit2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateMe } from "@/hooks/api/use-users";
import { type ProfileFormValues } from "@/schemas/user";
import { useAuthStore } from "@/stores/auth.store";

import { ProfileFormFields } from "./ProfileFormFields";

export const ProfileInfoTab = () => {
  const { t } = useTranslation(["profile", "validation", "common"]);
  const { user, setUser } = useAuthStore();
  const { mutate: updateMe, isPending: isLoading } = useUpdateMe();
  const [isEditing, setIsEditing] = useState(false);

  const initialValues: ProfileFormValues = {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    title: user?.title || "",
  };

  const [form] = Form.useForm<ProfileFormValues>();

  const onFinish = (values: ProfileFormValues) => {
    updateMe(values, {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    setIsEditing(false);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t("info.title")}
          </CardTitle>
          <CardDescription>{t("info.description")}</CardDescription>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(true);
            }}
            className="rounded-full px-4 h-9 gap-2 hover:bg-primary/5 hover:text-primary transition-colors flex shrink-0"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {t("common:buttons.edit")}
          </Button>
        )}
      </CardHeader>
      <Form<ProfileFormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        requiredMark={false}
      >
        <ProfileFormFields isEditing={isEditing} isLoading={isLoading} t={t} user={user} />

        {isEditing && (
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button type="submit" loading={isLoading} className="flex-1 sm:flex-none min-w-[120px]">
              {isLoading ? t("info.submitting") : t("info.submit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="flex-1 sm:flex-none gap-2"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              {t("common:buttons.cancel")}
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
};
