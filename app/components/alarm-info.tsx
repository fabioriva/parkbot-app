import { clsx } from "clsx";
import { Bell } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface AlarmInfoProps {
  active: number;
}

export function AlarmInfo({ active }: AlarmInfoProps) {
  return (
    <>
      {active > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <Bell color="red" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Active alarms {active}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
