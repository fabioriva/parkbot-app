import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item"
import { OperationsAvatar } from "~/components/operation-avatar"
import { formatPlantDateTime } from "~/lib/date-time"
import { usePlantTimeZone } from "~/hooks/use-plant-time-zone"
import { logT, safeMessageT } from "~/lib/trans"
import { m } from "@paraglide/messages.js"
import { cn } from "~/lib/utils"
import type { HistoryEntry } from "~/routes/aps/history"
import "./history-list.css"

interface HistoryListProps {
  query: HistoryEntry[]
  media?: boolean
  variant?: "compact" | "detailed"
}

export function HistoryList({
  query,
  media = false,
  variant = "compact",
}: HistoryListProps) {
  const timeZone = usePlantTimeZone()
  return (
    <ItemGroup className={`history-list history-list-${variant}`}>
      {query.map((item, key) => (
        <Item
          className={cn(
            "history-list-item",
            media && "history-list-with-media"
          )}
          key={key}
          role="listitem"
        >
          {media && (
            <ItemMedia className="history-list-media" aria-hidden="true">
              <OperationsAvatar
                device={item.device}
                operation={item.operation}
              />
            </ItemMedia>
          )}
          <ItemContent className="history-list-content">
            <div className="history-list-heading">
              <ItemTitle className="history-list-title">
                {item.device?.id === 0 && !item.user ? m.operator() : item.user}
                {item.device?.id !== 0 && item.device?.key}
              </ItemTitle>
              {item.device?.id !== 0 && (
                <span className="history-list-mode">
                  {safeMessageT("mode", item.mode?.key)}
                </span>
              )}
            </div>
            <ItemDescription className="history-list-description">
              {logT(item)}
            </ItemDescription>
          </ItemContent>
          <div className="history-list-timestamp">
            <time className="history-list-time" dateTime={item.date}>
              {timeZone
                ? formatPlantDateTime(item.date, timeZone, "HH:mm:ss")
                : "—"}
              {timeZone && (
                <span className="history-list-offset">
                  {formatPlantDateTime(item.date, timeZone, "xxx")}
                </span>
              )}
            </time>
            <span className="history-list-date">
              {timeZone
                ? formatPlantDateTime(item.date, timeZone, "dd/MM/yyyy")
                : "—"}
            </span>
          </div>
        </Item>
      ))}
    </ItemGroup>
  )
}
