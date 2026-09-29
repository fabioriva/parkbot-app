import {
  Item,
  ItemActions,
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

export function HistoryList({ query, media = false }: any) {
  const timeZone = usePlantTimeZone()
  return (
    <ItemGroup className="gap-0">
      {query.map((item, key) => (
        <Item className="px-0 py-1.5" key={key}>
          {media && (
            <ItemMedia>
              <OperationsAvatar
                device={item.device}
                operation={item.operation}
              />
            </ItemMedia>
          )}
          <ItemContent className="gap-0.5">
            <ItemTitle>
              {item.device.id === 0 && !item.user ? m.operator() : item.user}
              {item.device.id !== 0 && item.device.key}
              {item.device.id !== 0 && (
                <span className="text-normal">
                  {safeMessageT("mode", item.mode.key)}
                </span>
              )}
            </ItemTitle>
            <ItemDescription>
              <span className="line-clamp-1">{logT(item)}</span>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <div className="flex flex-col text-right">
              <span>
                {timeZone
                  ? formatPlantDateTime(item.date, timeZone, "dd/MM/yyyy")
                  : "—"}
              </span>
              <span>
                {timeZone
                  ? formatPlantDateTime(item.date, timeZone, "HH:mm:ss xxx")
                  : "—"}
              </span>
            </div>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
