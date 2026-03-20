import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    exclude: ["node_modules", "dist", ".next", "tests-e2e"],
  },
});
