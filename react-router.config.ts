import type { Config } from "@react-router/dev/config"

export default {
  ssr: true,
  // Public host and port for form submissions forwarded by the production proxy.
  allowedActionOrigins: ["sotefinservice.com:8080"],
} satisfies Config
