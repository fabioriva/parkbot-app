import { BadgeAlert } from "lucide-react";
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
              <span className="hidden sm:block">Active</span>
              <BadgeAlert
                className="block sm:hidden"
                data-icon="inline-start"
              />{" "}
              {active}
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
