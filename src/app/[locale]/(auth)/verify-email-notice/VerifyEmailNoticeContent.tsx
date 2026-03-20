"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthEmailField } from "@/components/auth/AuthEmailField";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormDescription } from "@/components/ui/form";
import { useResendVerificationMutation } from "@/hooks/api/use-auth";
import { getLocaleFromPath, ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { getForgotSchema, type ForgotFormValues } from "@/schemas/auth";

export function VerifyEmailNoticeContent() {
  const { t } = useTranslation(["auth", "errors"]);
  const { t: tv } = useTranslation("validation");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const router = useRouter();
  const emailParam = searchParams.get("email");

  const { mutate: resendEmail, isPending: isLoading, isSuccess } = useResendVerificationMutation();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(getForgotSchema(tv)),
    defaultValues: {
      email: emailParam || "",
    },
  });

  useEffect(() => {
    if (!emailParam) {
      router.replace(getLocalizedPath(ROUTES.login, currentLocale));
    }
  }, [emailParam, router, currentLocale]);

  if (!emailParam) {
    return null;
  }

  const onSubmit = (values: ForgotFormValues) => {
    resendEmail({ email: values.email });
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
          titleKey="verifyEmail.noticeTitle"
          subtitleKey="verifyEmail.noticeSubtitle"
          icon={Mail}
        />

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("verifyEmail.cardTitle")}</CardTitle>
            <CardDescription>{t("verifyEmail.cardDescription")}</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <AuthEmailField
                  form={form}
                  isLoading={isLoading}
                  t={t}
                  labelKey="login.emailLabel"
                  readOnly
                  className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                >
                  <FormDescription className="text-xs text-right opacity-70">
                    {t("verifyEmail.emailNote")}
                  </FormDescription>
                </AuthEmailField>

                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <p>{t("verifyEmail.resendSuccess")}</p>
                  </motion.div>
                )}

                <div className="flex flex-row gap-3 mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                    type="button"
                    disabled={isLoading}
                  >
                    <Link href={getLocalizedPath(ROUTES.login, currentLocale)}>
                      {t("verifyEmail.backToLogin")}
                    </Link>
                  </Button>
                  <Button className="flex-1" type="submit" disabled={isLoading || isSuccess}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("login.submitting")}
                      </>
                    ) : (
                      t("verifyEmail.resendButton")
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
