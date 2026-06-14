"use client";

import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/lib/format-date";
import type {
  AnnouncementKind,
  AnnouncementLanguage,
  AnnouncementLevel,
  BroadcastTemplate,
} from "@/lib/types/announcement";

import type { TFunction } from "i18next";

interface Props {
  kind: AnnouncementKind;
  level: AnnouncementLevel;
  template?: BroadcastTemplate;
  variables?: Record<string, string | Record<string, string>>;
  translations?: Record<string, { title?: string; body?: string }>;
}

const LEVEL_ACCENT: Record<AnnouncementLevel, string> = {
  info: "border-l-primary",
  warning: "border-l-amber-500",
  critical: "border-l-destructive",
};

// SYNC NOTE: in-app template text comes from FE i18n (broadcasts.json
// `templates.<key>`); the EMAIL text lives in the backend catalog
// (fastapi-template/app/core/broadcast_templates.py). When a template changes,
// update BOTH and keep keys + variable names identical.
// See memory: broadcast-template-text-dual-source.
function renderTemplate(
  t: TFunction,
  lang: AnnouncementLanguage,
  template: BroadcastTemplate | undefined,
  variables: Props["variables"],
): { title: string; body: string } | null {
  if (!template) return null;
  const values: Record<string, string> = {};
  for (const variable of template.variables) {
    const raw = variables?.[variable.name];
    if (variable.type === "datetime" && typeof raw === "string" && raw) {
      values[variable.name] = formatDateTime(raw); // viewer-local (in-app)
    } else if (variable.type === "text" && raw && typeof raw === "object") {
      values[variable.name] = raw[lang] ?? raw.en ?? raw.tr ?? "";
    }
  }
  return {
    title: t(`templates.${template.key}.title`),
    body: t(`templates.${template.key}.body`, values),
  };
}

function renderCustom(
  lang: AnnouncementLanguage,
  translations: Props["translations"],
): { title: string; body: string } | null {
  const entry = translations?.[lang] ?? translations?.en ?? translations?.tr;
  if (!entry?.title && !entry?.body) return null;
  return { title: entry.title ?? "", body: entry.body ?? "" };
}

export function AnnouncementPreview({ kind, level, template, variables, translations }: Props) {
  const { t, i18n } = useTranslation("broadcasts");
  const lang = (i18n.language?.split("-")[0] ?? "en") as AnnouncementLanguage;

  const content =
    kind === "template"
      ? renderTemplate(t, lang, template, variables)
      : renderCustom(lang, translations);

  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        {t("admin.previewEmpty")}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-l-4 border-border/60 bg-card/60 p-4 ${LEVEL_ACCENT[level]}`}
    >
      <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("admin.previewLabel")}
      </p>
      <h3 className="text-sm font-semibold text-foreground">{content.title}</h3>
      <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">{content.body}</p>
    </div>
  );
}
