"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative flex flex-col items-center justify-center">
        <h1 className="text-8xl sm:text-9xl font-extrabold tracking-widest text-primary opacity-20 select-none">
          Oops!
        </h1>
        <div className="absolute rotate-12 rounded bg-destructive px-2 py-0.5 text-xs sm:text-sm font-medium text-destructive-foreground">
          {t("common:error_occurred")}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 max-w-lg w-full">
        <p className="text-xl sm:text-2xl font-semibold md:text-3xl">
          {t("common:something_went_wrong")}
        </p>

        <div className="mt-6 flex flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button asChild variant="default" className="flex-1 sm:flex-none sm:w-32">
            <Link href="/">{t("common:go_home")}</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (reset) {
                reset();
              } else {
                window.location.reload();
              }
            }}
            className="flex-1 sm:flex-none sm:w-32"
          >
            {t("common:retry")}
          </Button>
        </div>
      </div>

      {process.env.NODE_ENV !== "production" && error && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg bg-muted p-4 text-left font-mono text-[10px] sm:text-xs border border-border">
          <p className="mb-2 font-bold text-destructive">Stack Trace (Dev only):</p>
          <div className="max-h-[200px] overflow-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap break-all">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorPage;
