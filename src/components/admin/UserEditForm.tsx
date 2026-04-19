"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { UserEditFormFields } from "@/components/admin/UserEditFormFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { AdminUser, AdminUserUpdatePayload } from "@/lib/types/admin";
import { getAdminUserUpdateSchema, type AdminUserUpdateFormValues } from "@/schemas/admin";

interface UserEditFormProps {
  user: AdminUser;
  isSelf: boolean;
  isSaving: boolean;
  onSubmit: (payload: AdminUserUpdatePayload) => void;
}

const userToFormValues = (user: AdminUser): AdminUserUpdateFormValues => ({
  first_name: user.first_name ?? "",
  last_name: user.last_name ?? "",
  title: user.title ?? "",
  email: user.email,
  role: (user.role as "admin" | "user") ?? "user",
  is_active: user.is_active,
  is_verified: user.is_verified,
});

export function UserEditForm({ user, isSelf, isSaving, onSubmit }: UserEditFormProps) {
  const { t } = useTranslation(["admin", "validation"]);

  const form = useForm<AdminUserUpdateFormValues>({
    resolver: zodResolver(getAdminUserUpdateSchema(t)),
    defaultValues: userToFormValues(user),
  });

  useEffect(() => {
    form.reset(userToFormValues(user));
  }, [user, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      first_name: values.first_name,
      last_name: values.last_name,
      title: values.title ? values.title : null,
      email: values.email,
      role: values.role,
      is_active: values.is_active,
      is_verified: values.is_verified,
    });
  });

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base">{t("admin:userDetail.editTitle")}</CardTitle>
        <CardDescription>{t("admin:userDetail.editDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <UserEditFormFields form={form} isSelf={isSelf} />
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset();
                }}
                disabled={isSaving}
              >
                {t("admin:userDetail.cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? t("admin:userDetail.saving") : t("admin:userDetail.save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
