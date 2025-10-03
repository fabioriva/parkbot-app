import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const DigitalIO = ({ bit }) => {
  const { label, status } = bit;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          className={
            status
              ? `bg-ready/10 dark:bg-ready/20 text-ready`
              : "bg-slate-500/10 text-slate-500"
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
