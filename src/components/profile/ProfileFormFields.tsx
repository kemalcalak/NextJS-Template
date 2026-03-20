"use client";

import { User, Briefcase, Mail } from "lucide-react";

import { CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ProfileFormValues } from "@/schemas/user";
import { type User as UserType } from "@/stores/auth.store";

import type { useForm } from "react-hook-form";

interface ProfileFormFieldsProps {
  form: ReturnType<typeof useForm<ProfileFormValues>>;
  isEditing: boolean;
  isLoading: boolean;
  t: (key: string) => string;
  user: UserType;
}

export const ProfileFormFields = ({
  form,
  isEditing,
  isLoading,
  t,
  user,
}: ProfileFormFieldsProps) => (
  <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("info.firstName")}</FormLabel>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder="John"
                  className={cn("pl-10", !isEditing && "bg-muted/30 cursor-default")}
                  {...field}
                  disabled={!isEditing || isLoading}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("info.lastName")}</FormLabel>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder="Doe"
                  className={cn("pl-10", !isEditing && "bg-muted/30 cursor-default")}
                  {...field}
                  disabled={!isEditing || isLoading}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("info.titleLabel")}</FormLabel>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input
                placeholder="Software Engineer"
                className={cn("pl-10", !isEditing && "bg-muted/30 cursor-default")}
                {...field}
                value={field.value || ""}
                disabled={!isEditing || isLoading}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="space-y-2">
      <Label>{t("info.email")}</Label>
      <div className="relative opacity-60">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input name="email" value={user?.email || ""} className="pl-10" readOnly disabled />
      </div>
      <p className="text-xs text-muted-foreground italic">{t("info.emailNotice")}</p>
    </div>
  </CardContent>
);
