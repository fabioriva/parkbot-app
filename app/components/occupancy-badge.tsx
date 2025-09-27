import { clsx } from "clsx";
import { CircleParking as Car } from "lucide-react";
import { ChartPie } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { OccupancyChart } from "~/components/occupancy-chart";

interface OccupancyItem {
  id: string;
  value: number;
}

interface OccupancyBadgeProps {
  occupancy: OccupancyItem[];
}

export function OccupancyBadge({ occupancy }: OccupancyBadgeProps) {
  const [busy, ,] = occupancy;
  const cars = busy && busy.value > 0 ? true : false;
  return (
    <Tooltip>
      <TooltipTrigger>
        {/* <Badge
          className={clsx({
            "bg-orange-100 border-orange-200 text-orange-600": true,
            "rounded-sm font-bold border text-sm": true,
          })}
        >
          <ChartPie /> {(busy && busy.value) || "---"}
        </Badge> */}
        <Car
        // color={clsx({
        //   orange: cars,
        //   gray: !cars,
        // })}
        />
      </TooltipTrigger>
      <TooltipContent className="aspect-square w-[250px] h-[250px]">
        <p>System occupancy</p>
        <OccupancyChart occupancy={occupancy} />
      </TooltipContent>
    </Tooltip>
  );
}
