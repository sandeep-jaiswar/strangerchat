import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  },
  client: {
    ADSENSE_CLIENT: z.string(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    ADSENSE_CLIENT: process.env.ADSENSE_CLIENT,
  },
})
