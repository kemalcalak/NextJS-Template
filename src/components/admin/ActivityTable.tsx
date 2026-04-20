"use client";

import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTime } from "@/lib/format-date";
import type {
  ActivityDetails as ActivityDetailsValue,
  AdminActivity,
  JsonValue,
} from "@/lib/types/admin";
import { cn } from "@/lib/utils";

type ScalarJson = string | number | boolean | null;

const isScalar = (value: JsonValue): value is ScalarJson =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const formatScalar = (value: ScalarJson): string => {
  if (value === null) return "null";
  return typeof value === "string" ? value : String(value);
};

function ActivityDetails({ details }: { details: ActivityDetailsValue | undefined }) {
  const entries: [string, JsonValue][] = Object.entries(details ?? {});
  if (entries.length === 0) {
    return <span className="text-muted-foreground/60">—</span>;
  }

  // When every value is a primitive we render compact "key: value" chips so
  // common cases like {reason: "invalid_password"} read at a glance. Anything
  // nested falls back to pretty-printed JSON in a scrollable code block.
  const scalarEntries: [string, ScalarJson][] = [];
  let allScalar = true;
  for (const [key, value] of entries) {
    if (!isScalar(value)) {
      allScalar = false;
      break;
    }
    scalarEntries.push([key, value]);
  }

  if (allScalar) {
    return (
      <div className="flex max-w-xs flex-wrap gap-1">
        {scalarEntries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]"
          >
            <span className="text-muted-foreground">{key}</span>
            <span className="text-foreground">{formatScalar(value)}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <pre className="max-h-40 max-w-xs overflow-auto rounded-md border border-border bg-muted/40 p-2 font-mono text-[11px] leading-snug text-foreground">
      {JSON.stringify(details, null, 2)}
    </pre>
  );
}

interface ActivityTableProps {
  rows: AdminActivity[];
  isLoading?: boolean;
  showUser?: boolean;
  emptyLabel?: string;
}

export function ActivityTable({
  rows,
  isLoading = false,
  showUser = true,
  emptyLabel,
}: ActivityTableProps) {
  const { t } = useTranslation("admin");

  if (isLoading && rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        {t("activities.loading")}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        {emptyLabel ?? t("activities.empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("activities.columns.when")}</th>
            {showUser ? <th className="px-4 py-3">{t("activities.columns.user")}</th> : null}
            <th className="px-4 py-3">{t("activities.columns.type")}</th>
            <th className="px-4 py-3">{t("activities.columns.resource")}</th>
            <th className="px-4 py-3">{t("activities.columns.status")}</th>
            <th className="px-4 py-3">{t("activities.columns.details")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className={cn("hover:bg-muted/30 transition-colors")}>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                {formatDateTime(row.created_at)}
              </td>
              {showUser ? (
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {row.user_id.slice(0, 8)}
                </td>
              ) : null}
              <td className="px-4 py-3 font-medium">
                {t(`activities.type.${row.activity_type}`)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {t(`activities.resource.${row.resource_type}`)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge tone={row.status === "success" ? "success" : "danger"}>
                  {t(`activities.status.${row.status}`)}
                </StatusBadge>
              </td>
              <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                <ActivityDetails details={row.details} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
