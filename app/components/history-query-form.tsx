import { format, endOfDay, startOfDay, subDays } from "date-fns"
import { useState } from "react"
import { Form } from "react-router"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  // FieldSeparator,
  FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { DateRange } from "~/components/date-range"
import { m } from "@paraglide/messages.js"

export function HistoryQueryForm({ devices, handleQuery, open, setOpen }) {
  const [card, setCard] = useState(0)
  const [dateRange, setDateRange] = useState({
    from: subDays(startOfDay(new Date()), 1),
    to: endOfDay(new Date()),
  })
  const [device, setDevice] = useState(0)
  const [stall, setStall] = useState(0)

  const handleSearch = () => {
    const dateFrom = format(startOfDay(dateRange.from), "yyyy-MM-dd HH:mm:ss")
    const dateTo = format(endOfDay(dateRange.to), "yyyy-MM-dd HH:mm:ss")
    handleQuery(card, dateFrom, dateTo, device, stall)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>History search parameters</DialogTitle>
          <DialogDescription>Fine tune your query.</DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSearch}>
          <FieldSet className="mb-3">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="date-range">Date range</FieldLabel>
                <DateRange
                  id="date-range"
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="device">Select device or all</FieldLabel>
                <Select id="device" value={device} onValueChange={setDevice}>
                  <SelectTrigger className="w-45">
                    <SelectValue>
                      {devices.find((item) => item.id === device).name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {devices.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="card">Card Number</FieldLabel>
                <Input
                  type="number"
                  id="card"
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  required
                />
                <FieldDescription>
                  Enter the card number to search or 0 = all
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="stall">Stall Number</FieldLabel>
                <Input
                  type="number"
                  id="stall"
                  value={stall}
                  onChange={(e) => setStall(e.target.value)}
                  required
                  required
                />
                <FieldDescription>
                  Enter the stall number to search or 0 = all
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose
              render={<Button type="submit">Search history</Button>}
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
