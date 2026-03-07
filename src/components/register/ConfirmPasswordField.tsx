import { Lock, Eye, EyeOff } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type RegisterFormValues } from "@/schemas/auth";

interface ConfirmPasswordFieldProps {
    form: UseFormReturn<RegisterFormValues>;
    isLoading: boolean;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (show: boolean) => void;
    t: (key: string) => string;
}

export const ConfirmPasswordField = ({
    form,
    isLoading,
    showConfirmPassword,
    setShowConfirmPassword,
    t,
}: ConfirmPasswordFieldProps) => (
    <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
            <FormItem className="grid gap-2">
                <FormLabel className="text-left">{t("register.confirmPasswordLabel")}</FormLabel>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            {...field}
                        />
                    </FormControl>
                    <button
                        type="button"
                        onClick={() => {
                            setShowConfirmPassword(!showConfirmPassword);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <FormMessage className="text-left text-xs font-medium" />
            </FormItem>
        )}
    />
);
