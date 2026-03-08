"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthEmailField } from "@/components/auth/AuthEmailField";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLoginMutation } from "@/hooks/api/use-auth";
import { getLocaleFromPath, ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { getLoginSchema, type LoginFormValues } from "@/schemas/auth";

export default function Login() {
  const { t } = useTranslation(["auth", "validation"]);
  const { t: tv } = useTranslation("validation");
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const { mutate: login, isPending: isLoading } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => getLoginSchema(tv), [tv]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AuthHeader t={t} titleKey="login.title" subtitleKey="login.subtitle" icon={Lock} />

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("login.cardTitle")}</CardTitle>
            <CardDescription>{t("login.cardDescription")}</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <CardContent className="grid gap-4">
                <AuthEmailField
                  form={form}
                  isLoading={isLoading}
                  t={t}
                  labelKey="login.emailLabel"
                />

                <AuthPasswordField
                  form={form}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  t={t}
                  labelKey="login.passwordLabel"
                >
                  <Link
                    href={getLocalizedPath(ROUTES.forgotPassword, currentLocale)}
                    className="text-sm font-medium text-primary hover:underline transition-all"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </AuthPasswordField>

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true);
                          }}
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="rememberMe"
                        className="text-sm font-medium cursor-pointer leading-none"
                      >
                        {t("login.rememberMe")}
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-4 mt-4">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("login.submitting")}
                      </>
                    ) : (
                      t("login.submitButton")
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    {t("login.noAccount")}{" "}
                    <Link
                      href={getLocalizedPath(ROUTES.register, currentLocale)}
                      className="font-medium text-primary hover:underline transition-all"
                    >
                      {t("login.register")}
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
