import { type FieldValues, type Path, type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AuthNameFieldsProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  isLoading: boolean;
  t: (key: string) => string;
  firstNameLabelKey: string;
  lastNameLabelKey: string;
  firstNameName?: Path<TFieldValues>;
  lastNameName?: Path<TFieldValues>;
}

export function AuthNameFields<TFieldValues extends FieldValues>({
  form,
  isLoading,
  t,
  firstNameLabelKey,
  lastNameLabelKey,
  firstNameName = "first_name" as Path<TFieldValues>,
  lastNameName = "last_name" as Path<TFieldValues>,
}: AuthNameFieldsProps<TFieldValues>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={firstNameName}
        render={({ field }) => (
          <FormItem className="grid gap-2 text-left">
            <FormLabel>{t(firstNameLabelKey)}</FormLabel>
            <FormControl>
              <Input placeholder="Kemal" disabled={isLoading} {...field} />
            </FormControl>
            <FormMessage className="text-xs font-medium" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={lastNameName}
        render={({ field }) => (
          <FormItem className="grid gap-2 text-left">
            <FormLabel>{t(lastNameLabelKey)}</FormLabel>
            <FormControl>
              <Input placeholder="Çalak" disabled={isLoading} {...field} />
            </FormControl>
            <FormMessage className="text-xs font-medium" />
          </FormItem>
        )}
      />
    </div>
  );
}
