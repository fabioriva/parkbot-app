import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const DigitalIO = ({ bit, color }) => {
  const { label, status } = bit;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          className={
            status
              ? `bg-${color}-200 text-${color}-600`
              : "bg-slate-100 text-slate-600"
          }
          variant="default"
        >
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="uppercase">{status ? "true" : "false"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
