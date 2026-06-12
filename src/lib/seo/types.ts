export type SeoLocale = "en" | "tr";

export type SeoPageKey =
  | "home"
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "verifyEmail"
  | "verifyEmailNotice"
  | "accountSuspended"
  | "dashboard"
  | "profile"
  | "support"
  | "notifications"
  | "adminLogin"
  | "adminDashboard"
  | "adminUsers"
  | "adminUserDetail"
  | "adminAdmins"
  | "adminFiles"
  | "adminActivities"
  | "adminSupport"
  | "adminNotifications"
  | "adminTicketDetail"
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
