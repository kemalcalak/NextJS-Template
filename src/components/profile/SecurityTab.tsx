"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Shield, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useForm, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DangerZone } from "@/components/profile/DangerZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useChangePasswordMutation } from "@/hooks/api/use-auth";
import { getChangePasswordSchema, type ChangePasswordFormValues } from "@/schemas/user";

interface PasswordFieldProps {
  control: Control<ChangePasswordFormValues>;
  name: keyof ChangePasswordFormValues;
  label: string;
  isLoading: boolean;
  icon: React.ReactNode;
}

const PasswordField = ({ control, name, label, isLoading, icon }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            {icon}
            <FormControl>
              <Input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => {
                setShow(!show);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const SecurityTab = () => {
  const { t } = useTranslation(["profile", "validation"]);
  const { mutate: changePassword, isPending: isLoading } = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(getChangePasswordSchema(t)),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    const { confirmPassword: _, ...payload } = data;
    changePassword(payload, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t("security.title")}
          </CardTitle>
          <CardDescription>{t("security.description")}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <PasswordField
                control={form.control}
                name="current_password"
                label={t("security.currentPassword")}
                isLoading={isLoading}
                icon={
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                }
              />

              <Separator className="my-2" />

              <PasswordField
                control={form.control}
                name="new_password"
                label={t("security.newPassword")}
                isLoading={isLoading}
                icon={
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                }
              />

              <PasswordField
                control={form.control}
                name="confirmPassword"
                label={t("security.confirmPassword")}
                isLoading={isLoading}
                icon={
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                }
              />

              <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("security.submitting")}
                    </>
                  ) : (
                    t("security.submit")
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>

      <DangerZone />
    </div>
  );
};
