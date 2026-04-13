import { useState } from "react";
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

export function DateRange({ from, to, handleQuery }) {
  // console.log(typeof from, from, typeof to, to);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: parse(from, "yyyy-MM-dd HH:mm", new Date()),
    to: parse(to, "yyyy-MM-dd HH:mm", new Date()),
  });
  const handleDateRange = (range) => {
    // console.log(range);
    handleQuery(range);
    setDateRange(range);
    setOpen(false);
  };
  return (
    <div>
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
            numberOfMonths={2}
            className="rounded-lg border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
