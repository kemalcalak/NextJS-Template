"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthEmailField } from "@/components/auth/AuthEmailField";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { authService } from "@/lib/api/endpoints/auth";
import { ROUTES, getLocaleFromPath, getLocalizedPath } from "@/lib/config/routes";
import { getLoginSchema, type LoginFormValues } from "@/schemas/auth";
import { useAuthStore } from "@/stores/auth.store";

export function AdminLoginContent() {
  const { t } = useTranslation(["admin", "auth", "validation"]);
  const { t: tv } = useTranslation("validation");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(getLoginSchema(tv)),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  // The admin login hits the same /auth/login endpoint as the public one. The
  // admin layout then gates non-admin users client-side and kicks them back to
  // the public dashboard, so non-admins can never see the admin shell.
  //
  // `router.replace` (not push) prevents "back" from returning to the login
  // surface after we've moved past it. `router.refresh()` forces the server
  // components — including the protected layout's cookie read — to re-run so
  // the just-set access_token cookie is honoured immediately.
  const { mutate: loginMutate, isPending: isLoading } = useMutation({
    mutationFn: (payload: LoginFormValues) => authService.login(payload),
    onSuccess: (data) => {
      login(data.user);
      const target = data.user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard;
      router.replace(getLocalizedPath(target, currentLocale));
      router.refresh();
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin:login.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin:login.subtitle")}</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{t("admin:login.cardTitle")}</CardTitle>
            <CardDescription>{t("admin:login.cardDescription")}</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                loginMutate(data);
              })}
              noValidate
            >
              <CardContent className="grid gap-4">
                <AuthEmailField
                  form={form}
                  isLoading={isLoading}
                  t={t}
                  labelKey="admin:login.emailLabel"
                />
                <AuthPasswordField
                  form={form}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  t={t}
                  labelKey="admin:login.passwordLabel"
                />
                <div className="flex flex-col gap-3 mt-4">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("admin:login.submitting")}
                      </>
                    ) : (
                      t("admin:login.submitButton")
                    )}
                  </Button>
                  <Link
                    href={getLocalizedPath(ROUTES.home, currentLocale)}
                    className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("admin:login.backToApp")}
                  </Link>
                </div>
              </CardContent>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
