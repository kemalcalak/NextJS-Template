import i18n from "@/i18n/config";

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

const format = (iso: DateInput, opts: Intl.DateTimeFormatOptions): string => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(i18n.language || "en", opts).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatDate = (iso: DateInput): string => format(iso, DATE_OPTIONS);

export const formatDateTime = (iso: DateInput): string => format(iso, DATETIME_OPTIONS);
