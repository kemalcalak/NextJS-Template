"use client";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUserUpdateFormValues } from "@/schemas/admin";

import type { UseFormReturn } from "react-hook-form";

interface UserEditFormFieldsProps {
  form: UseFormReturn<AdminUserUpdateFormValues>;
  isSelf: boolean;
}

export function UserEditFormFields({ form, isSelf }: UserEditFormFieldsProps) {
  const { t } = useTranslation("admin");

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userDetail.fields.firstName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userDetail.fields.lastName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
            <FormLabel>{t("userDetail.fields.title")}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userDetail.fields.role")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSelf}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">{t("users.role.admin")}</SelectItem>
                  <SelectItem value="user">{t("users.role.user")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => {
                    field.onChange(v === true);
                  }}
                  disabled={isSelf}
                />
              </FormControl>
              <FormLabel className="m-0 text-sm">{t("userDetail.fields.active")}</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => {
                    field.onChange(v === true);
                  }}
                />
              </FormControl>
              <FormLabel className="m-0 text-sm">{t("userDetail.fields.verified")}</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
