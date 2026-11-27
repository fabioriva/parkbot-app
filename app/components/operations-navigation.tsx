import { NavLink } from "react-router"
import { Button } from "~/components/ui/button"
import type { PlantDateRange } from "~/lib/date-time"
import { m } from "@paraglide/messages.js"

export function OperationsNavigation({
  aps,
  range,
  view,
}: {
  aps: string
  range?: PlantDateRange
  view: "overview" | "cards"
}) {
  const path = `/aps/${encodeURIComponent(aps)}/operations`
  const search = range ? `?${new URLSearchParams(range)}` : ""
  return (
    <nav
      aria-label={m.operations_title()}
      className="mb-3 flex flex-wrap gap-2"
    >
      <Button
        variant={view === "overview" ? "secondary" : "ghost"}
        nativeButton={false}
        render={<NavLink end to={path + search} />}
      >
        {m.operations_overview_tab()}
      </Button>
      <Button
        variant={view === "cards" ? "secondary" : "ghost"}
        nativeButton={false}
        render={<NavLink end to={path + "/cards" + search} />}
      >
        {m.operations_cards_tab()}
      </Button>
    </nav>
  )
}
