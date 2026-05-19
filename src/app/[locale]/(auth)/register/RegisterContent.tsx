"use client";

import { Form } from "antd";
import { UserPlus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { AuthEmailField } from "@/components/auth/AuthEmailField";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthNameFields } from "@/components/auth/AuthNameFields";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterMutation } from "@/hooks/api/use-auth";
import { getLocaleFromPath, ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import {
  getConfirmPasswordSchema,
  getEmailSchema,
  getPasswordSchema,
  type RegisterFormValues,
} from "@/schemas/auth";

export function RegisterContent() {
  const { t } = useTranslation(["auth", "validation"]);
  const { t: tv } = useTranslation("validation");
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { mutate: registerUser, isPending: isLoading } = useRegisterMutation();

  const onFinish = ({ confirmPassword: _, ...payload }: RegisterFormValues) => {
    registerUser(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AuthHeader
          t={t}
          titleKey="register.title"
          subtitleKey="register.subtitle"
          icon={UserPlus}
        />

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("register.cardTitle")}</CardTitle>
            <CardDescription>{t("register.cardDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form<RegisterFormValues>
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              requiredMark={false}
            >
              <AuthNameFields
                t={t}
                disabled={isLoading}
                firstNameLabelKey="register.firstNameLabel"
                lastNameLabelKey="register.lastNameLabel"
              />

              <Form.Item
                name="email"
                label={t("register.emailLabel")}
                rules={[zodFieldRule(getEmailSchema(tv))]}
              >
                <AuthEmailField disabled={isLoading} />
              </Form.Item>

              <Form.Item
                name="password"
                label={t("register.passwordLabel")}
                rules={[zodFieldRule(getPasswordSchema(tv))]}
              >
                <AuthPasswordField disabled={isLoading} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={t("register.confirmPasswordLabel")}
                dependencies={["password"]}
                rules={[
                  zodFieldRule(getConfirmPasswordSchema(tv)),
                  ({ getFieldValue }) => ({
                    validator(_rule, value: string) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error(tv("confirmPasswordMismatch")));
                    },
                  }),
                ]}
              >
                <AuthPasswordField disabled={isLoading} />
              </Form.Item>

              <div className="flex flex-col gap-4 mt-4">
                <Button className="w-full" type="submit" loading={isLoading}>
                  {isLoading ? t("register.submitting") : t("register.submitButton")}
                </Button>
                <div className="text-center text-sm">
                  {t("register.hasAccount")}{" "}
                  <Link
                    href={getLocalizedPath(ROUTES.login, currentLocale)}
                    className="font-medium text-primary hover:underline transition-all"
                  >
                    {t("register.login")}
                  </Link>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
