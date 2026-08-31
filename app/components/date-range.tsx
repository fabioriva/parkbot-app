import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

import { type DateRange } from "react-day-picker"

export function DateRange({ dateRange, setDateRange }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id="date"
            className="w-auto justify-between font-normal"
          >
            {dateRange
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            setDateRange(range)
            setOpen(false)
          }}
          numberOfMonths={2}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}
