import { CircleParking } from "lucide-react";
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

interface OccupancyInfoProps {
  occupancy: OccupancyItem[];
}

export function OccupancyInfo({ occupancy }: OccupancyInfoProps) {
  const [busy, ,] = occupancy;
  const cars = busy && busy.value > 0 ? true : false;
  return (
    <Tooltip>
      <TooltipTrigger>
        <CircleParking />
      </TooltipTrigger>
      <TooltipContent className="aspect-square w-[250px] h-[250px]">
        <p>System occupancy</p>
        <OccupancyChart occupancy={occupancy} />
      </TooltipContent>
    </Tooltip>
  );
}
