import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

import { type DateRange as DateRangeValue } from "react-day-picker"

type DateRangeProps = {
  id?: string
  dateRange: DateRangeValue | undefined
  setDateRange: (range: DateRangeValue | undefined) => void
}

export function DateRange({ id, dateRange, setDateRange }: DateRangeProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            type="button"
            id={id}
            className="w-auto justify-between font-normal"
          >
            {dateRange?.from
              ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() ?? "…"}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          required
          resetOnSelect
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            setDateRange(range)
            if (range?.from && range?.to) setOpen(false)
          }}
          numberOfMonths={2}
          className="rounded-lg border"
        />
      </PopoverContent>
    </Popover>
  )
}
