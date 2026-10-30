import { CarFront } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { safeMessageT } from "~/lib/trans"
import { m } from "@paraglide/messages.js"
import "./park-info.css"

interface OccupancyItem {
  id: string
  value: number
}

interface OccupancyInfoProps {
  occupancy?: OccupancyItem[] | null
  user: {
    aps: string
  }
}

export function ParkInfo({ occupancy, user }: OccupancyInfoProps) {
  const rows = ["busy", "free", "lock"].map((id) => {
    const value = occupancy?.find((item) => item.id === id)?.value
    return {
      id,
      value:
        typeof value === "number" && Number.isSafeInteger(value) && value >= 0
          ? value
          : null,
    }
  })
  const busy = rows[0].value
  const total = rows.every((item) => item.value !== null)
    ? rows.reduce((sum, item) => sum + item.value!, 0)
    : null

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="outline"
            render={
              <a
                href={`/aps/${user.aps}/map`}
                aria-label={
                  busy === null
                    ? m.park_info_unavailable()
                    : m.park_info_map_label({ count: busy })
                }
              >
                <span className="hidden sm:block">{m.occupancy_parked()}</span>
                <CarFront
                  className="block sm:hidden"
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                <span className="font-mono font-semibold tabular-nums">
                  {busy ?? "—"}
                </span>
              </a>
            }
          />
        }
      />
      <TooltipContent className="park-info-tooltip">
        <div className="park-info-body">
          <p className="park-info-title">{m.occupancy_title()}</p>
          <dl>
            {rows.map((item) => (
              <div
                className="park-info-row"
                data-occupancy={item.id}
                key={item.id}
              >
                <dt>
                  <span className="park-info-dot" aria-hidden="true" />
                  {safeMessageT("occupancy", item.id)}
                </dt>
                <dd>{item.value ?? "—"}</dd>
              </div>
            ))}
            <div className="park-info-row park-info-total">
              <dt>{m.occupancy_total()}</dt>
              <dd>{total ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
