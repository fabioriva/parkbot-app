import { User as Car } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface OccupancyItem {
  id: string;
  value: number;
}

interface OccupancyInfoProps {
  occupancy: OccupancyItem[];
}

export function ParkInfo({ occupancy, user }: OccupancyInfoProps) {
  const [busy, ,] = occupancy;
  const cars = busy && busy.value > 0 ? true : false;
  const total = (arr) => arr.reduce((acc, curr) => acc + curr.value, 0);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" asChild>
          <a href={`/aps/${user.aps}/map`}>
            <span className="hidden sm:block">Parked</span>
            <Car className="block sm:hidden" data-icon="inline-start" />{" "}
            {busy.value}
          </a>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col">
        <table className="m-0 p-0">
          <thead>
            <tr>
              <th>Parking occupancy</th>
            </tr>
          </thead>
          <tbody>
            {occupancy.map((item, key) => (
              <tr className="capitalize" key={key}>
                <td>{item.id}</td>
                <td className="w-16 text-right">{item.value}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="capitalize">
              <td>Total spaces</td>
              <td className="w-16 text-right">{total(occupancy)}</td>
            </tr>
          </tfoot>
        </table>
      </TooltipContent>
    </Tooltip>
  );
}
