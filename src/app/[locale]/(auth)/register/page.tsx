"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthEmailField } from "@/components/auth/AuthEmailField";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthNameFields } from "@/components/auth/AuthNameFields";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRegisterMutation } from "@/hooks/api/use-auth";
import { getLocaleFromPath } from "@/lib/config/routes";
import { getRegisterSchema, type RegisterFormValues } from "@/schemas/auth";

export default function Register() {
  const { t } = useTranslation(["auth", "validation"]);
  const { t: tv } = useTranslation("validation");
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { mutate: registerUser, isPending: isLoading } = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = useMemo(() => getRegisterSchema(tv), [tv]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword: _, ...payload } = data;
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <CardContent className="grid gap-4">
                <AuthNameFields
                  form={form}
                  isLoading={isLoading}
                  t={t}
                  firstNameLabelKey="register.firstNameLabel"
                  lastNameLabelKey="register.lastNameLabel"
                />

                <AuthEmailField
                  form={form}
                  isLoading={isLoading}
                  t={t}
                  labelKey="register.emailLabel"
                />

                <AuthPasswordField
                  form={form}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  t={t}
                  labelKey="register.passwordLabel"
                />

                <AuthPasswordField
                  form={form}
                  isLoading={isLoading}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  t={t}
                  labelKey="register.confirmPasswordLabel"
                  name="confirmPassword"
                />

                <div className="flex flex-col gap-4 mt-4">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("register.submitting")}
                      </>
                    ) : (
                      t("register.submitButton")
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    {t("register.hasAccount")}{" "}
                    <Link
                      href={`/${currentLocale}/login`}
                      className="font-medium text-primary hover:underline transition-all"
                    >
                      {t("register.login")}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
