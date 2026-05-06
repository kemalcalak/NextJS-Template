"use client";

import { Form } from "antd";
import { Lock, Shield, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DangerZone } from "@/components/profile/DangerZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useChangePasswordMutation } from "@/hooks/api/use-auth";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import {
  getConfirmPasswordSchema,
  getPasswordSchema,
  getRequiredPasswordSchema,
} from "@/schemas/auth";
import { type ChangePasswordFormValues } from "@/schemas/user";

export const SecurityTab = () => {
  const { t } = useTranslation(["profile", "validation"]);
  const { t: tv } = useTranslation("validation");
  const { mutate: changePassword, isPending: isLoading } = useChangePasswordMutation();
  const [form] = Form.useForm<ChangePasswordFormValues>();

  const onFinish = ({ confirmPassword: _, ...payload }: ChangePasswordFormValues) => {
    changePassword(payload, {
      onSuccess: () => {
        form.resetFields();
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t("security.title")}
          </CardTitle>
          <CardDescription>{t("security.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form<ChangePasswordFormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ current_password: "", new_password: "", confirmPassword: "" }}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              name="current_password"
              label={t("security.currentPassword")}
              rules={[zodFieldRule(getRequiredPasswordSchema(tv))]}
            >
              <Input
                type="password"
                placeholder="••••••••"
                prefix={<Lock className="h-4 w-4 text-muted-foreground" />}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </Form.Item>

            <Separator className="my-2" />

            <Form.Item
              name="new_password"
              label={t("security.newPassword")}
              rules={[zodFieldRule(getPasswordSchema(tv))]}
            >
              <Input
                type="password"
                placeholder="••••••••"
                prefix={<Lock className="h-4 w-4 text-muted-foreground" />}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t("security.confirmPassword")}
              dependencies={["new_password"]}
              rules={[
                zodFieldRule(getConfirmPasswordSchema(tv)),
                ({ getFieldValue }) => ({
                  validator(_rule, value: string) {
                    if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                    return Promise.reject(new Error(tv("confirmPasswordMismatch")));
                  },
                }),
              ]}
            >
              <Input
                type="password"
                placeholder="••••••••"
                prefix={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="pt-4">
              <Button type="submit" loading={isLoading} className="w-full md:w-auto">
                {isLoading ? t("security.submitting") : t("security.submit")}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      <DangerZone />
    </div>
  );
};
