import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  plugins: [react()] as any,
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/.next/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "**/*.stories.tsx",
        ".storybook/",
        ".next/",
        "coverage/",
        "storybook-static/",
      ],
    },
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "./components"),
      utils: path.resolve(__dirname, "./utils"),
      lib: path.resolve(__dirname, "./lib"),
      app: path.resolve(__dirname, "./app"),
    },
  },
})
