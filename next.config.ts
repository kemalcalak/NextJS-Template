import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
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
