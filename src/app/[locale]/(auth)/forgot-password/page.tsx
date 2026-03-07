"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, MailCheck } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/hooks/api/use-auth";
import { getForgotSchema, type ForgotFormValues } from "@/schemas/auth";

import type { AxiosError } from "axios";

export default function ForgotPassword() {
  const { t } = useTranslation("auth");
  const { t: tv } = useTranslation("validation");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(getForgotSchema(tv)),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const msg = axiosError.response?.data?.detail || t("forgotPassword.errorMsg");
      setError(msg);
    }
  };

  const isPending = forgotPasswordMutation.isPending;

  if (success) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("forgotPassword.successTitle")}</h1>
          <p className="text-muted-foreground">
            {t("forgotPassword.successDescPrefix")}{" "}
            <span className="font-medium text-foreground">{form.getValues().email}</span>.
          </p>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/login">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("forgotPassword.backToLogin")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <MailCheck className="h-6 w-6" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">{t("forgotPassword.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("forgotPassword.subtitle")}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forgotPassword.emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="text"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" className="flex-1" disabled={isPending}>
                <Link href="/login">{t("forgotPassword.backToLogin")}</Link>
              </Button>
              <Button className="flex-1" type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t("forgotPassword.submitting") : t("forgotPassword.submitButton")}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
