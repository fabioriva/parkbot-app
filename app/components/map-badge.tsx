import { clsx } from "clsx";
import { ChartPie } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { OccupancyChart } from "~/components/occupancy-chart";

interface MapItem {
  id: string;
  value: number;
}

interface MapBadgeProps {
  occupancy: MapItem[];
}

export function MapBadge({ occupancy }: MapBadgeProps) {
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
        <p>System occupancy</p>
        <OccupancyChart occupancy={occupancy} />
      </TooltipContent>
    </Tooltip>
  );
}
