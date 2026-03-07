import { Mail } from "lucide-react";
import { type FieldValues, type Path, type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AuthEmailFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  isLoading: boolean;
  t: (key: string) => string;
  labelKey: string;
  name?: Path<TFieldValues>;
}

export function AuthEmailField<TFieldValues extends FieldValues>({
  form,
  isLoading,
  t,
  labelKey,
  name = "email" as Path<TFieldValues>,
}: AuthEmailFieldProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid gap-2 text-left">
          <FormLabel>{t(labelKey)}</FormLabel>
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
          <FormMessage className="text-xs font-medium" />
        </FormItem>
      )}
    />
  );
}
