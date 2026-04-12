"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { useDeactivateMe } from "@/hooks/api/use-users";
import { useLanguage } from "@/hooks/use-language";
import { ROUTES, getLocalizedPath } from "@/lib/config/routes";
import { getDeactivateAccountSchema, type DeactivateAccountFormValues } from "@/schemas/user";
import { useAuthStore } from "@/stores/auth.store";

export const DangerZone = () => {
  const { t } = useTranslation(["account", "validation"]);
  const [open, setOpen] = useState(false);
  const { mutate: deactivate, isPending } = useDeactivateMe();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { language } = useLanguage();

  const form = useForm<DeactivateAccountFormValues>({
    resolver: zodResolver(getDeactivateAccountSchema(t)),
    defaultValues: { password: "", acknowledge: false },
  });

  const onSubmit = (values: DeactivateAccountFormValues) => {
    deactivate(values.password, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        // Backend already cleared the auth cookies. Clear the client store
        // and route to the login page so the user has to re-authenticate
        // before landing on the "account deactivated" screen.
        logout();
        router.push(getLocalizedPath(ROUTES.login, language));
      },
    });
  };

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t("account:deactivate.title")}
        </CardTitle>
        <CardDescription>{t("account:deactivate.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={() => {
            setOpen(true);
          }}
        >
          {t("account:deactivate.cta")}
        </Button>
      </CardContent>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <AlertDialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {t("account:deactivate.dialog.title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("account:deactivate.dialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("account:deactivate.dialog.passwordLabel")}</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          autoComplete="current-password"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acknowledge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        {t("account:deactivate.dialog.acknowledgeLabel")}
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending} type="button">
                  {t("account:deactivate.dialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isPending || !form.formState.isValid}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("account:deactivate.dialog.submitting")}
                      </>
                    ) : (
                      t("account:deactivate.dialog.confirm")
                    )}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
