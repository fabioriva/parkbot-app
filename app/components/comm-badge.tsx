import { clsx } from "clsx";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function Comm({ status }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          className={clsx({
            "bg-green-100 border-green-200 text-green-600": status,
            "bg-red-100 border-red-200 text-red-600": !status,
            "rounded-sm font-bold border text-sm": true,
          })}
        >
          PLC
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="uppercase">{status ? "online" : "offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
