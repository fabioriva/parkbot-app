import type { ReactNode } from "react"
import { SWRConfig } from "swr"
import { HttpError } from "~/lib/fetch"

// Each mounted page owns its cache; leaving the page discards that scope.
const cacheConfig = {
  provider: () => new Map(),
  shouldRetryOnError: (error: unknown) =>
    !(error instanceof HttpError && [401, 403, 404].includes(error.status)),
}

export function PageDataCache({ children }: { children: ReactNode }) {
  return <SWRConfig value={cacheConfig}>{children}</SWRConfig>
}
