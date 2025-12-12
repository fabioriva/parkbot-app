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
        {status ? <Wifi color="lime" /> : <WifiOff color="red" />}
      </TooltipTrigger>
      <TooltipContent>
        <p className="uppercase">{status ? "online" : "offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
