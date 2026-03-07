import { Lock, Eye, EyeOff } from "lucide-react";
import { type FieldValues, type Path, type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AuthPasswordFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  t: (key: string) => string;
  labelKey: string;
  name?: Path<TFieldValues>;
  children?: React.ReactNode;
}

export function AuthPasswordField<TFieldValues extends FieldValues>({
  form,
  isLoading,
  showPassword,
  setShowPassword,
  t,
  labelKey,
  name = "password" as Path<TFieldValues>,
  children,
}: AuthPasswordFieldProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid gap-2 text-left">
          <div className="flex items-center justify-between">
            <FormLabel>{t(labelKey)}</FormLabel>
            {children}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FormMessage className="text-xs font-medium" />
        </FormItem>
      )}
    />
  );
}
