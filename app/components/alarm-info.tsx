import { Badge } from "~/components/ui/badge";
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
          <TooltipTrigger asChild>
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              Active {active}
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
