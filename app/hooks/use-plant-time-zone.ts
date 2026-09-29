import { useOutletContext } from "react-router"
import { isValidTimeZone } from "~/lib/date-time"

export function usePlantTimeZone(): string | null {
  const context = useOutletContext<{ aps?: { timeZone?: string } }>()
  const timeZone = context?.aps?.timeZone
  return isValidTimeZone(timeZone) ? timeZone : null
}
