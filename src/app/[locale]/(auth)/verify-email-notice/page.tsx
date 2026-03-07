"use client";

import { Suspense, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResendVerificationMutation } from "@/hooks/api/use-auth";
import { getResendVerificationSchema, type ResendVerificationFormValues } from "@/schemas/auth";

function VerifyEmailNoticeContent() {
  const { t } = useTranslation(["auth", "errors"]);
  const { t: tv } = useTranslation("validation");
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email");

  const { mutate: resendEmail, isPending: isLoading, isSuccess } = useResendVerificationMutation();

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(getResendVerificationSchema(tv)),
    defaultValues: {
      email: emailParam || "",
    },
  });

  useEffect(() => {
    if (!emailParam) {
      router.replace("/login");
    }
  }, [emailParam, router]);

  if (!emailParam) {
    return null;
  }

  const onSubmit = (values: ResendVerificationFormValues) => {
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
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <Mail className="h-6 w-6" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("verifyEmail.noticeTitle") || "Verify your email"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("verifyEmail.noticeSubtitle") || "You need to verify your email address to log in."}
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t("verifyEmail.cardTitle") || "Verification Required"}</CardTitle>
            <CardDescription>
              {t("verifyEmail.cardDescription") ||
                "We sent a verification link to your email address."}
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.emailLabel")}</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="email"
                            readOnly
                            className="pl-10 bg-muted/50 cursor-not-allowed"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormDescription className="text-xs">
                        {t("verifyEmail.emailNote") ||
                          "This email address is associated with your account and cannot be changed here."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <p>
                      {t("verifyEmail.resendSuccess") || "Verification email resent successfully!"}
                    </p>
                  </motion.div>
                )}
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button asChild variant="outline" className="flex-1" type="button">
                  <Link href="/login">{t("verifyEmail.backToLogin") || "Back to login"}</Link>
                </Button>
                <Button className="flex-1" type="submit" disabled={isLoading || isSuccess}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("login.submitting")}
                    </>
                  ) : (
                    t("verifyEmail.resendButton") || "Resend"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailNotice() {
  return (
    <Suspense>
      <VerifyEmailNoticeContent />
    </Suspense>
  );
}
