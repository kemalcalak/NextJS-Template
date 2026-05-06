"use client";

import { useEffect } from "react";

import { App as AntdApp, ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import trTR from "antd/locale/tr_TR";
import { useTheme } from "next-themes";

import { darkAntdTokens, lightAntdTokens } from "@/lib/theme/colors";
import { bindNotification } from "@/lib/toast";

const ANTD_LOCALES: Record<string, typeof enUS> = {
  en: enUS,
  tr: trTR,
};

// Exposes antd's theme-aware notification instance to module-level callers
// (e.g. lib/api/api.ts) that cannot use App.useApp() directly.
function NotificationBridge({ children }: { children: React.ReactNode }) {
  const { notification } = AntdApp.useApp();

  useEffect(() => {
    bindNotification(notification);
    return () => {
      bindNotification(null);
    };
  }, [notification]);

  return children;
}

export function AntdProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tokens = isDark ? darkAntdTokens : lightAntdTokens;

  return (
    <ConfigProvider
      locale={ANTD_LOCALES[locale] ?? enUS}
      theme={{
        cssVar: { key: "antd" },
        hashed: false,
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: tokens.primary,
          colorError: tokens.error,
          borderRadius: 10,
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <AntdApp>
        <NotificationBridge>{children}</NotificationBridge>
      </AntdApp>
    </ConfigProvider>
  );
}
