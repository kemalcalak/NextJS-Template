import "./src/env";

import { withSentryConfig } from "@sentry/nextjs";

import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// The realtime WebSocket connects directly to the backend origin (not through the
// Next rewrite proxy), so its ws(s):// scheme must be whitelisted in connect-src
// — CSP treats ws:// and http:// as distinct and would otherwise block it.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? apiUrl.replace(/^http/, "ws");

// Content-Security-Policy kept intentionally conservative. Next itself needs
// inline scripts/styles to hydrate; relax with nonces later if stricter CSP
// is required. 'unsafe-eval' is only needed in dev for Turbopack HMR.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' ${apiUrl} ${wsUrl}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Next 16 blocks cross-origin fetches to dev resources (HMR, source maps)
  // unless the host is explicitly allowed. Playwright's baseURL is
  // 127.0.0.1:3000, so without this entry the HMR websocket fails and
  // downstream hydration can stall on the loading.tsx fallback.
  allowedDevOrigins: ["127.0.0.1"],
  // Remote hosts next/image may optimise. Cloudinary serves uploaded support
  // attachments and avatars; mirror this in the CSP img-src above.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
  },
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
  rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1";

    return [
      {
        // Proxy all requests starting with apiPrefix to the actual backend
        source: `${apiPrefix}/:path*`,
        destination: `${apiUrl}${apiPrefix}/:path*`,
      },
    ];
  },
};

// Sentry wraps next.config to upload source maps and instrument the build.
// Source map upload only runs when SENTRY_AUTH_TOKEN is set; safe to omit
// in local dev or when no Sentry project exists yet.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  webpack: { treeshake: { removeDebugLogging: true } },
});
