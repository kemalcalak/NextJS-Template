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
  /** Sayfa URL yolu, örn: "/dashboard" */
  pathname?: string;
  /** Metadata'yı override etmek için */
  overrides?: Partial<SeoPageMeta>;
}
