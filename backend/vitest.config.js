import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      SUPABASE_URL: "https://mock-supabase-project.supabase.co",
      SUPABASE_ANON_KEY: "mock-supabase-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "mock-supabase-service-role-key",
      PORT: "3001",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/db/**", "src/config/**"],
    },
    // Chạy test tuần tự để tránh conflict giữa các test
    sequence: {
      concurrent: false,
    },
  },
});
