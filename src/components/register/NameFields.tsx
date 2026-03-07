import { User } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormValues } from "@/schemas/auth";

interface NameFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
  isLoading: boolean;
  t: (key: string) => string;
}

export const NameFields = ({ form, isLoading, t }: NameFieldsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="first_name"
      render={({ field }) => (
        <FormItem className="grid gap-2">
          <FormLabel className="text-left">
            {t("register.firstNameLabel") || "First Name"}
          </FormLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input placeholder="Ali Kemal" className="pl-10" disabled={isLoading} {...field} />
            </FormControl>
          </div>
          <FormMessage className="text-left text-xs font-medium" />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="last_name"
      render={({ field }) => (
        <FormItem className="grid gap-2">
          <FormLabel className="text-left">{t("register.lastNameLabel") || "Last Name"}</FormLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input placeholder="Çalak" className="pl-10" disabled={isLoading} {...field} />
            </FormControl>
          </div>
          <FormMessage className="text-left text-xs font-medium" />
        </FormItem>
      )}
    />
  </div>
);
