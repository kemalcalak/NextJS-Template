export type SeoLocale = "en" | "tr";

export type SeoPageKey =
  | "home"
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "verifyEmail"
  | "verifyEmailNotice"
  | "dashboard"
  | "profile"
  | "adminLogin"
  | "adminDashboard"
  | "adminUsers"
  | "adminUserDetail"
  | "adminActivities"
  | "notFound"
  | "error";

export interface SeoPageMeta {
  title: string;
  description: string;
}

export type SeoTranslations = Record<string, SeoPageMeta>;

export interface BuildMetadataOptions {
  locale: SeoLocale;
  pageKey: SeoPageKey;
  /** Page URL path, e.g., "/dashboard" */
  pathname?: string;
  /** Optional overrides for metadata */
  overrides?: Partial<SeoPageMeta>;
}
