import type { ReactNode } from "react"
import { SWRConfig } from "swr"

// Each mounted page owns its cache; leaving the page discards that scope.
const cacheConfig = { provider: () => new Map() }

export function PageDataCache({ children }: { children: ReactNode }) {
  return <SWRConfig value={cacheConfig}>{children}</SWRConfig>
}
