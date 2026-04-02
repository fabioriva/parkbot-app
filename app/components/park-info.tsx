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
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" asChild>
          <a href={`/aps/${user.aps}/map`}>Parked {busy.value}</a>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Parking occupancy</p>
        <table className="mt-1">
          <tbody>
            {occupancy.map((item, key) => (
              <tr className="capitalize" key={key}>
                <td>{item.id}</td>
                <td className="w-16 text-right">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TooltipContent>
    </Tooltip>
  );
}
