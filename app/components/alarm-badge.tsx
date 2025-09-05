import { clsx } from "clsx";
import { CircleAlert } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface AlarmBadgeProps {
  active: number;
}

export function AlarmBadge({ active }: AlarmBadgeProps) {
  return (
    <>
      {active >= 0 && (
        <Tooltip>
          <TooltipTrigger>
            <Badge
              className={clsx({
                "bg-red-100 border-red-200 text-red-600": true,
                "rounded-sm font-bold border text-sm": true,
              })}
            >
              <CircleAlert /> {active}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Active alarms {active}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
