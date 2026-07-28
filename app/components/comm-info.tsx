import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface CommInfoProps {
  status: boolean;
}

export function CommInfo({ status, user }: CommInfoProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a href={`/aps/${user.aps}/racks`}>
          {status ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              PLC
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              PLC
            </Badge>
          )}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>{status ? "PLC is online" : "PLC is offline"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
