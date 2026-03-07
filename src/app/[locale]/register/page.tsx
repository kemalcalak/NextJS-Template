"use client";

import { useState, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ConfirmPasswordField } from "@/components/register/ConfirmPasswordField";
import { EmailField } from "@/components/register/EmailField";
import { NameFields } from "@/components/register/NameFields";
import { PasswordField } from "@/components/register/PasswordField";
import { RegisterHeader } from "@/components/register/RegisterHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRegisterMutation } from "@/hooks/api/use-auth";
import { getRegisterSchema, type RegisterFormValues } from "@/schemas/auth";

export default function Register() {
  const { t } = useTranslation(["auth", "validation"]);
  const { t: tv } = useTranslation("validation");
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
        <RegisterHeader t={t} />

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("register.cardTitle")}</CardTitle>
            <CardDescription>{t("register.cardDescription")}</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <CardContent className="grid gap-4">
                <NameFields form={form} isLoading={isLoading} t={t} />
                <EmailField form={form} isLoading={isLoading} t={t} />
                <PasswordField
                  form={form}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  t={t}
                />
                <ConfirmPasswordField
                  form={form}
                  isLoading={isLoading}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  t={t}
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
                      href="/login"
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
