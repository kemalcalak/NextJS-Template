"use client";

import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUser } from "@/lib/types/admin";

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export function UserOverviewCard({ user }: { user: AdminUser }) {
  const { t } = useTranslation("admin");

  const rows: { label: string; value: string }[] = [
    { label: "ID", value: user.id.slice(0, 12) },
    { label: "Created", value: formatDate(user.created_at) },
    { label: "Updated", value: formatDate(user.updated_at) },
    { label: "Deactivated", value: formatDate(user.deactivated_at) },
    { label: "Scheduled deletion", value: formatDate(user.deletion_scheduled_at) },
  ];

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base">{t("userDetail.overviewTitle")}</CardTitle>
        <CardDescription>{t("userDetail.overviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono text-xs">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
