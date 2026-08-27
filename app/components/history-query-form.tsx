import { parse } from "date-fns"
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
import { DateRange } from "~/components/calendar"
import { m } from "@paraglide/messages.js"

export function HistoryQueryForm({
  dateFrom,
  dateTo,
  handleSearch,
  open,
  setOpen,
}) {
  const [card, setCard] = useState(0)
  const [dateRange, setDateRange] = useState({
    from: parse(dateFrom, "yyyy-MM-dd HH:mm", new Date()),
    to: parse(dateTo, "yyyy-MM-dd HH:mm", new Date()),
  })
  const [stall, setStall] = useState(0)
  const handleDateRange = (range) => {
    setRange(range)
  }
  const handleSearch_ = () => {
    // console.log(card, dateRange, stall)
    handleSearch(card, dateRange, stall)
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>History search parameters</DialogTitle>
          <DialogDescription>Fine tune your query.</DialogDescription>
        </DialogHeader>
        {/* <fetcher.Form method="post" onSubmit={() => setOpen(false)}> */}
        <Form onSubmit={handleSearch_}>
          <FieldSet className="mb-3">
            <FieldGroup>
              {/* <input name="action" value={action} type="hidden" /> */}
              {/* <div className="flex items-center justify-between gap-4">
                <Field>
                  <DateSingle id="from" />
                </Field>
                <Field>
                  <DateSingle id="to" />
                </Field>
              </div> */}
              <Field>
                <FieldLabel htmlFor="date-range">Date range</FieldLabel>
                <DateRange
                  id="date-range"
                  // from={dateFrom}
                  // to={dateTo}
                  // handleQuery={handleDateRange}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
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
            <Button type="submit">Search history</Button>
            {/* {fetcher.state !== "idle" && <p>Saving...</p>} */}
          </DialogFooter>
          {/* </fetcher.Form> */}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
