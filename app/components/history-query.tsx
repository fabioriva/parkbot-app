import * as React from "react";
import { parse } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type DateRange } from "react-day-picker";

export function HistoryQuery({ from, to, handleQuery }) {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: parse(from, "yyyy-MM-dd HH:mm", new Date()), // new Date(2025, 5, 12),
    to: parse(to, "yyyy-MM-dd HH:mm", new Date()), // new Date(2025, 6, 15),
  });
  const handleDateRange = (range) => {
    // console.log(range);
    handleQuery(range);
    setDateRange(range);
    // setOpen(false);
  };

  return (
    <div className="">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {dateRange
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRange}
            numberOfMonths={1}
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
