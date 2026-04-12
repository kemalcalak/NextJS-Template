import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy kept intentionally conservative. Next itself needs
// inline scripts/styles to hydrate; relax with nonces later if stricter CSP
// is required. 'unsafe-eval' is only needed in dev for Turbopack HMR.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""}`,
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

export default nextConfig;
