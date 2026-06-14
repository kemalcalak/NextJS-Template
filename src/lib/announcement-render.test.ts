import { describe, expect, it, vi } from "vitest";

import { announcementBody, announcementTitle } from "@/lib/announcement-render";
import type { AnnouncementFields } from "@/lib/announcement-render";

import type { TFunction } from "i18next";

// Format datetimes deterministically so assertions don't depend on the runner's
// locale/timezone — we only care that the variable was substituted at all.
vi.mock("@/lib/format-date", () => ({
  formatDateTime: (value: string): string => `FMT(${value})`,
}));

// The in-app template text the render helper looks up by key. Mirrors the real
// broadcasts.json shape (`broadcasts:templates.<key>.<field>`) with {{var}}
// placeholders i18next would interpolate.
const TEMPLATE_TEXT: Record<string, string> = {
  "broadcasts:templates.maintenance.title": "Scheduled Maintenance",
  "broadcasts:templates.maintenance.body": "From {{starts_at}} to {{ends_at}}.",
  "broadcasts:templates.new_feature.title": "New Feature",
  "broadcasts:templates.new_feature.body": "Now live: {{feature}}.",
};

// A minimal i18next-like translator: resolves a key then interpolates {{name}}
// from the options bag, leaving unknown placeholders intact. Cast to TFunction
// since the render helper only ever calls it as `t(key, values)` — a test
// double, not the full i18next surface.
const makeT = (): TFunction => {
  const translate = (key: string, options?: Record<string, string>): string => {
    const template = TEMPLATE_TEXT[key] ?? key;
    return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
      options?.[name] !== undefined ? options[name] : `{{${name}}}`,
    );
  };
  return translate as unknown as TFunction;
};

describe("announcement-render — template kind", () => {
  const t = makeT();

  it("renders a template title and body from the i18n catalog", () => {
    const fields: AnnouncementFields = {
      kind: "template",
      template_key: "new_feature",
      variables: { feature: { en: "Dark mode", tr: "Karanlik mod" } },
    };

    expect(announcementTitle(t, "en", fields)).toBe("New Feature");
    expect(announcementBody(t, "en", fields)).toBe("Now live: Dark mode.");
  });

  it("picks a text variable in the active language", () => {
    const fields: AnnouncementFields = {
      kind: "template",
      template_key: "new_feature",
      variables: { feature: { en: "Dark mode", tr: "Karanlik mod" } },
    };

    expect(announcementBody(t, "tr", fields)).toBe("Now live: Karanlik mod.");
  });

  it("falls back to en, then tr, for a text variable missing the active language", () => {
    const onlyTr: AnnouncementFields = {
      kind: "template",
      template_key: "new_feature",
      variables: { feature: { tr: "Sadece TR" } },
    };

    // Active language en is absent on the value → falls through to tr.
    expect(announcementBody(t, "en", onlyTr)).toBe("Now live: Sadece TR.");
  });

  it("formats datetime variables via formatDateTime", () => {
    const fields: AnnouncementFields = {
      kind: "template",
      template_key: "maintenance",
      variables: { starts_at: "2026-01-01T14:00:00Z", ends_at: "2026-01-02T15:00:00Z" },
    };

    expect(announcementBody(t, "en", fields)).toBe(
      "From FMT(2026-01-01T14:00:00Z) to FMT(2026-01-02T15:00:00Z).",
    );
  });

  it("leaves a placeholder intact when its variable is absent", () => {
    const fields: AnnouncementFields = {
      kind: "template",
      template_key: "maintenance",
      variables: { starts_at: "2026-01-01T14:00:00Z" },
    };

    expect(announcementBody(t, "en", fields)).toBe(
      "From FMT(2026-01-01T14:00:00Z) to {{ends_at}}.",
    );
  });
});

describe("announcement-render — custom kind", () => {
  const t = makeT();

  it("reads stored translations for the active language", () => {
    const fields: AnnouncementFields = {
      kind: "custom",
      translations: {
        en: { title: "Hello", body: "English body" },
        tr: { title: "Merhaba", body: "Turkce govde" },
      },
    };

    expect(announcementTitle(t, "tr", fields)).toBe("Merhaba");
    expect(announcementBody(t, "tr", fields)).toBe("Turkce govde");
  });

  it("falls back en → tr when the active language has no translation", () => {
    const fields: AnnouncementFields = {
      kind: "custom",
      translations: { tr: { title: "Sadece TR", body: "Govde" } },
    };

    expect(announcementTitle(t, "en", fields)).toBe("Sadece TR");
  });

  it("returns an empty string when no translation exists at all", () => {
    const fields: AnnouncementFields = { kind: "custom", translations: {} };

    expect(announcementTitle(t, "en", fields)).toBe("");
    expect(announcementBody(t, "en", fields)).toBe("");
  });
});
