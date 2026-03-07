"use client";

import { Suspense, useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, XCircle, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useResetPasswordMutation } from "@/hooks/api/use-auth";
import { getResetSchema, type ResetFormValues } from "@/schemas/auth";

import type { AxiosError } from "axios";

const SuccessState = ({ t }: { t: (key: string) => string }) => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
    <div className="mx-auto w-full max-w-md space-y-6 text-center animate-in fade-in duration-500">
      <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
      <h1 className="text-2xl font-bold tracking-tight">{t("resetPassword.successTitle")}</h1>
      <p className="text-muted-foreground">{t("resetPassword.successDesc")}</p>
      <Button asChild className="w-full mt-4">
        <Link href="/login">{t("resetPassword.loginNow")}</Link>
      </Button>
    </div>
  </div>
);

const InvalidLinkState = ({ t }: { t: (key: string) => string }) => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
    <div className="mx-auto w-full max-w-md space-y-6 text-center">
      <XCircle className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold tracking-tight">{t("resetPassword.invalidLinkTitle")}</h1>
      <p className="text-muted-foreground">{t("resetPassword.invalidLinkDesc")}</p>
      <Button asChild className="mt-4">
        <Link href="/login">{t("login.login")}</Link>
      </Button>
    </div>
  </div>
);

const ResetHeader = ({ t }: { t: (key: string) => string }) => (
  <div className="mb-8 text-center">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
    >
      <ShieldCheck className="h-6 w-6" />
    </motion.div>
    <h1 className="text-3xl font-bold tracking-tight">{t("resetPassword.title")}</h1>
    <p className="text-muted-foreground mt-2">{t("resetPassword.subtitle")}</p>
  </div>
);

function ResetPasswordForm() {
  const { t } = useTranslation("auth");
  const { t: tv } = useTranslation("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPasswordMutation();
  const isPending = resetPasswordMutation.isPending;

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(getResetSchema(tv)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) return;
    setError(null);
    try {
      await resetPasswordMutation.mutateAsync({ token, new_password: values.password });
      setSuccess(true);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      setError(axiosError.response?.data?.detail || t("resetPassword.errorMsg"));
    }
  };

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [success, router]);

  if (!token) return <InvalidLinkState t={t} />;
  if (success) return <SuccessState t={t} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <ResetHeader t={t} />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resetPassword.newPassword")}</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => {
                        setShowPassword(!showPassword);
                      }}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resetPassword.confirmNewPassword")}</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => {
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      disabled={isPending}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t("resetPassword.submitting") : t("resetPassword.submitButton")}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
