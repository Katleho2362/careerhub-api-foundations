import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:5234",
    },
    server: {
      deps: {
        inline: ["next-auth"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/server": path.resolve(
        __dirname,
        "./src/test/__mocks__/next-server.ts"
      ),
      "next/headers": path.resolve(
        __dirname,
        "./src/test/__mocks__/next-headers.ts"
      ),
    },
  },
});