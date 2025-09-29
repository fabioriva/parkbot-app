import { clsx } from "clsx";
import { Wifi, WifiOff } from "lucide-react";
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
          <Wifi className="ml-0.5" color="green" />
        ) : (
          <WifiOff className="ml-0.5" color="red" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p className="uppercase">{status ? "online" : "offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
