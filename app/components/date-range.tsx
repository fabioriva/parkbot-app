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
  timeZone?: "UTC"
  today?: Date
  dateRange: DateRangeValue | undefined
  setDateRange: (range: DateRangeValue | undefined) => void
}

export function DateRange({
  id,
  dateRange,
  setDateRange,
  timeZone,
  today,
}: DateRangeProps) {
  const [open, setOpen] = useState(false)
  const formatDate = (date: Date) =>
    timeZone ? date.toISOString().slice(0, 10) : date.toLocaleDateString()
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
              ? `${formatDate(dateRange.from)} - ${dateRange.to ? formatDate(dateRange.to) : "…"}`
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          timeZone={timeZone}
          today={today}
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
