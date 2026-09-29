import { useState, type FormEvent } from "react"
import type { DateRange as DateRangeValue } from "react-day-picker"
import { Form } from "react-router"
import { Button } from "~/components/ui/button"
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
import { calendarDate, type PlantDateRange } from "~/lib/date-time"
import { m } from "@paraglide/messages.js"

type Props = {
  devices: { id: number; name: string }[]
  handleQuery: (
    card: number,
    range: PlantDateRange,
    device: number,
    stall: number
  ) => Promise<void>
  open: boolean
  setOpen: (open: boolean) => void
  timeZone: string
  initialRange: PlantDateRange
  today: string
  initialFilters: { card: number; device: number; stall: number }
}

export function HistoryQueryForm({
  devices,
  handleQuery,
  open,
  setOpen,
  timeZone,
  initialRange,
  initialFilters,
  today,
}: Props) {
  const [card, setCard] = useState(initialFilters.card)
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>({
    from: calendarDate(initialRange.from),
    to: calendarDate(initialRange.to),
  })
  const [device, setDevice] = useState(initialFilters.device)
  const [stall, setStall] = useState(initialFilters.stall)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!dateRange?.from || !dateRange?.to) return

    setPending(true)
    setError("")
    try {
      await handleQuery(
        card,
        {
          from: dateRange.from.toISOString().slice(0, 10),
          to: dateRange.to.toISOString().slice(0, 10),
        },
        device,
        stall
      )
      setOpen(false)
    } catch (error) {
      setError(
        error instanceof RangeError
          ? m.history_date_range_invalid()
          : m.history_request_failed()
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>History search parameters</DialogTitle>
          <DialogDescription>
            {m.aps_field_time_zone()}: {timeZone}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSearch}>
          <FieldSet className="mb-3" disabled={pending}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="date-range">Date range</FieldLabel>
                <DateRange
                  id="date-range"
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  // UTC carries civil dates without browser-zone shifts.
                  timeZone="UTC"
                  today={calendarDate(today)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="device">Select device or all</FieldLabel>
                <Select
                  id="device"
                  value={device}
                  onValueChange={(value) => setDevice(value ?? 0)}
                >
                  <SelectTrigger className="w-45">
                    <SelectValue>
                      {devices.find((item) => item.id === device)?.name}
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
                  onChange={(e) => setCard(Number(e.target.value))}
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
                  onChange={(e) => setStall(Number(e.target.value))}
                  required
                />
                <FieldDescription>
                  Enter the stall number to search or 0 = all
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          {error && <FieldError>{error}</FieldError>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              disabled={pending || !dateRange?.from || !dateRange?.to}
            >
              Search history
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
