"use client";

import { Form } from "antd";
import { User, Briefcase, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodFieldRule } from "@/lib/validation/zodToAntdRule";
import { getNameSchema } from "@/schemas/auth";
import { type User as UserType } from "@/stores/auth.store";

import type { TFunction } from "i18next";

interface ProfileFormFieldsProps {
  isEditing: boolean;
  isLoading: boolean;
  t: TFunction;
  user: UserType;
}

export const ProfileFormFields = ({ isEditing, isLoading, t, user }: ProfileFormFieldsProps) => {
  const { t: tv } = useTranslation("validation");
  const fieldDisabled = !isEditing || isLoading;
  const inputClassName = cn(!isEditing && "bg-muted/30 cursor-default");
  const userIcon = <User className="h-4 w-4 text-muted-foreground" />;
  const nameRule = zodFieldRule(getNameSchema(tv));

  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item name="first_name" label={t("info.firstName")} rules={[nameRule]}>
          <Input
            placeholder="John"
            prefix={userIcon}
            className={inputClassName}
            disabled={fieldDisabled}
          />
        </Form.Item>
        <Form.Item name="last_name" label={t("info.lastName")} rules={[nameRule]}>
          <Input
            placeholder="Doe"
            prefix={userIcon}
            className={inputClassName}
            disabled={fieldDisabled}
          />
        </Form.Item>
      </div>

      <Form.Item name="title" label={t("info.titleLabel")}>
        <Input
          placeholder="Software Engineer"
          prefix={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          className={inputClassName}
          disabled={fieldDisabled}
        />
      </Form.Item>

      <div className="space-y-2">
        <Label htmlFor="email">{t("info.email")}</Label>
        <Input
          id="email"
          name="email"
          value={user?.email || ""}
          prefix={<Mail className="h-4 w-4 text-muted-foreground" />}
          className="opacity-60"
          readOnly
          disabled
        />
        <p className="text-xs text-muted-foreground italic">{t("info.emailNotice")}</p>
      </div>
    </CardContent>
  );
};
