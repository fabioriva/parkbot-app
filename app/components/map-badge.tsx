import { clsx } from "clsx";
import { ChartPie } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { OccupancyChart } from "~/components/occupancy-chart";

export function MapBadge({ occupancy }) {
  const [busy, ,] = occupancy;
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          className={clsx({
            "bg-orange-100 border-orange-200 text-orange-600": true,
            "rounded-sm font-bold border text-sm": true,
          })}
        >
          <ChartPie /> {(busy && busy.value) || "---"}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="aspect-square w-[250px] h-[250px]">
        <h1 className="font-bold text-sm text-neutral-500">System occupancy</h1>
        <OccupancyChart occupancy={occupancy} />
      </TooltipContent>
    </Tooltip>
  );
}
