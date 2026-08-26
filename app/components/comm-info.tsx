import { Badge } from "~/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"

interface CommInfoProps {
  status: boolean
  user: {
    aps: string
  }
}

export function CommInfo({ status, user }: CommInfoProps) {
  return (
    <Badge
      className={
        status
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      }
    >
      <Tooltip>
        <TooltipTrigger render={<a href={`/aps/${user.aps}/racks`}>PLC </a>} />
        {/* <a href={`/aps/${user.aps}/racks`}>PLC </a>
        </TooltipTrigger> */}
        <TooltipContent>
          <p>{status ? "PLC is online" : "PLC is offline"}</p>
        </TooltipContent>
      </Tooltip>
    </Badge>
  )
}
