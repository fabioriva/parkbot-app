// import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface CommInfoProps {
  status: boolean;
}

export function CommInfo({ status }: CommInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        {status ? (
          // <Wifi color="green" size="20" />
          <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            ONLINE
          </Badge>
        ) : (
          // <WifiOff color="red" size="20" />
          <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
            OFFLINE
          </Badge>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{status ? "PLC is online" : "PLC is offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
