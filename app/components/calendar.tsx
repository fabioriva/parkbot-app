import { parse } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover"

import { type DateRange } from "react-day-picker"

export function DateSingle({}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(undefined)
  const handleDateSingle = (date) => {
    handleQuery(date)
    setDate(date)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id="date"
            className="w-auto justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "From date"}
            <ChevronDownIcon />
          </Button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border"
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRange({ dateRange, setDateRange }) {
  const [open, setOpen] = useState(false)
  // const [dateRange, setDateRange] = useState<DateRange | undefined>({
  //   from: parse(from, "yyyy-MM-dd HH:mm", new Date()),
  //   to: parse(to, "yyyy-MM-dd HH:mm", new Date()),
  // })
  // const handleDateRange = (range) => {
  //   handleQuery(range)
  //   setDateRange(range)
  //   setOpen(false)
  // }
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
