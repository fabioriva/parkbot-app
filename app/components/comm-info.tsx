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
          <Wifi color="green" size="20" />
        ) : (
          <WifiOff color="red" size="20" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p className="capitalize">{status ? "Plc online" : "Plc offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
