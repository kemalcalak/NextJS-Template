import { Lock, Eye, EyeOff } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormValues } from "@/schemas/auth";

interface PasswordFieldProps {
    form: UseFormReturn<RegisterFormValues>;
    isLoading: boolean;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    t: (key: string) => string;
}

export const PasswordField = ({
    form,
    isLoading,
    showPassword,
    setShowPassword,
    t,
}: PasswordFieldProps) => (
    <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
            <FormItem className="grid gap-2">
                <FormLabel className="text-left">{t("register.passwordLabel")}</FormLabel>
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
                <FormMessage className="text-left text-xs font-medium" />
            </FormItem>
        )}
    />
);
