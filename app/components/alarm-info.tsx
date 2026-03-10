import { BellRing } from "lucide-react";
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
            <BellRing className="animate-pulse fill-red-500 text-red-500" size="20" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Active alarms {active}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
