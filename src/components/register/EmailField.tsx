import { Mail } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormValues } from "@/schemas/auth";

interface EmailFieldProps {
  form: UseFormReturn<RegisterFormValues>;
  isLoading: boolean;
  t: (key: string) => string;
}

export const EmailField = ({ form, isLoading, t }: EmailFieldProps) => (
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem className="grid gap-2">
        <FormLabel className="text-left">{t("register.emailLabel")}</FormLabel>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <FormControl>
            <Input
              type="text"
              placeholder="kemalcalak@gmail.com"
              className="pl-10"
              disabled={isLoading}
              {...field}
            />
          </FormControl>
        </div>
        <FormMessage className="text-left text-xs font-medium" />
      </FormItem>
    )}
  />
);
