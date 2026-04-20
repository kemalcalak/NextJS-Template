"use client";

import { useLanguage } from "@/hooks/use-language";

type DateInput = string | null | undefined;

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "2-digit",
};

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

const format = (iso: DateInput, locale: string, opts: Intl.DateTimeFormatOptions): string => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatDate = (iso: DateInput, locale: string): string =>
  format(iso, locale, DATE_OPTIONS);

export const formatDateTime = (iso: DateInput, locale: string): string =>
  format(iso, locale, DATETIME_OPTIONS);

export function useFormatDate() {
  const { language } = useLanguage();
  return {
    formatDate: (iso: DateInput) => formatDate(iso, language),
    formatDateTime: (iso: DateInput) => formatDateTime(iso, language),
  };
}
