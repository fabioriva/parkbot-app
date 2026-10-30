import { Badge } from "~/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { m } from "@paraglide/messages.js"
import "./comm-info.css"

interface CommInfoProps {
  status: boolean
  user: {
    aps: string
  }
}

export function CommInfo({ status, user }: CommInfoProps) {
  const statusText = status ? m.comm_info_online() : m.comm_info_offline()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="outline"
            className="comm-info-badge"
            data-online={status}
            render={
              <a
                href={`/aps/${user.aps}/racks`}
                aria-label={m.comm_info_link_label({ status: statusText })}
              >
                <span className="comm-info-dot" aria-hidden="true" />
                PLC
              </a>
            }
          />
        }
      />
      <TooltipContent className="comm-info-tooltip">
        <div className="comm-info-body">
          <div className="comm-info-heading">
            <span className="comm-info-title">{m.comm_info_title()}</span>
            <span className="comm-info-status" data-online={status}>
              {statusText}
            </span>
          </div>
          <p className="comm-info-hint">{m.comm_info_hint()}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
