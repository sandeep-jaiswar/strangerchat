import type { StorybookConfig } from "@storybook/nextjs"
import path from "node:path"

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs",
    options: {
      // No __dirname needed
      nextConfigPath: path.resolve(process.cwd(), "next.config.ts"),
    },
  },
  staticDirs: [path.resolve(process.cwd(), "assets")],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/components": path.resolve(process.cwd(), "components"),
      }
    }
    return config
  },
}

export default config
