import { useEffect, useId, useRef } from "react"
import type { FetcherWithComponents } from "react-router"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Spinner } from "~/components/ui/spinner"
import { Alert, AlertDescription } from "~/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { m } from "@paraglide/messages.js"
import type { Aps } from "~/lib/aps.server"

export type EditableAps = Omit<Aps, "_id">
export interface ApsMutationFeedback {
  success?: string
  error?: string
  action?: string
}
export type ApsMutationFetcher = Pick<
  FetcherWithComponents<ApsMutationFeedback>,
  "Form" | "state" | "data"
>

interface ApsFormProps {
  action: "create" | "update"
  fetcher: ApsMutationFetcher
  open: boolean
  setOpen: (open: boolean) => void
  selectedAps?: EditableAps
}

export function ApsForm({
  action,
  fetcher,
  open,
  setOpen,
  selectedAps,
}: ApsFormProps) {
  const id = useId()
  const editing = action === "update"
  const busy = fetcher.state !== "idle"
  const submitted = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !submitted.current || busy) return
    if (fetcher.data?.success) {
      submitted.current = false
      setOpen(false)
    } else if (fetcher.data?.error) {
      submitted.current = false
      errorRef.current?.focus()
    }
  }, [open, busy, fetcher.data, setOpen])
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy && !submitted.current) setOpen(nextOpen)
      }}
    >
      <DialogContent
        className="flex max-h-[calc(100svh-2rem)] flex-col sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {editing ? m.aps_action_update() : m.aps_action_add()}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? m.aps_action_update_description()
              : m.aps_action_add_description()}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          className="flex min-h-0 flex-col"
          method="post"
          aria-busy={busy}
          onSubmit={(event) => {
            if (busy || submitted.current) {
              event.preventDefault()
              return
            }
            submitted.current = true
          }}
        >
          <input name="action" value={action} type="hidden" />
          <div className="max-h-[60vh] min-h-0 overflow-y-auto px-1 pb-5">
            {!busy && fetcher.data?.error && (
              <Alert
                variant="destructive"
                className="mb-4"
                ref={errorRef}
                tabIndex={-1}
              >
                <AlertDescription>{fetcher.data.error}</AlertDescription>
              </Alert>
            )}
            <FieldGroup className="gap-6">
              <FieldSet disabled={busy}>
                <FieldLegend variant="label" className="font-semibold">
                  {m.aps_section_identity()}
                </FieldLegend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${id}-company`}>
                      {m.aps_field_company()}
                    </FieldLabel>
                    <Input
                      id={`${id}-company`}
                      name="company"
                      defaultValue={selectedAps?.company}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-name`}>
                      {m.aps_field_name()}
                    </FieldLabel>
                    <Input
                      id={`${id}-name`}
                      name="name"
                      defaultValue={selectedAps?.name}
                      required
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor={`${id}-ns`}>
                      {m.aps_field_ns()}
                    </FieldLabel>
                    <Input
                      id={`${id}-ns`}
                      name="ns"
                      defaultValue={selectedAps?.ns}
                      readOnly={editing}
                      aria-describedby={editing ? `${id}-ns-help` : undefined}
                      className="font-mono read-only:bg-muted/50"
                      required
                    />
                    {editing && (
                      <FieldDescription
                        id={`${id}-ns-help`}
                        className="text-xs"
                      >
                        {m.aps_ns_readonly_help()}
                      </FieldDescription>
                    )}
                  </Field>
                </div>
              </FieldSet>
              <FieldSet disabled={busy}>
                <FieldLegend variant="label" className="font-semibold">
                  {m.aps_column_location()}
                </FieldLegend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${id}-country`}>
                      {m.aps_field_country()}
                    </FieldLabel>
                    <Input
                      id={`${id}-country`}
                      name="country"
                      defaultValue={selectedAps?.country}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-city`}>
                      {m.aps_field_city()}
                    </FieldLabel>
                    <Input
                      id={`${id}-city`}
                      name="city"
                      defaultValue={selectedAps?.city}
                      required
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
                  <Field>
                    <FieldLabel htmlFor={`${id}-flag`}>
                      {m.aps_field_flag()}
                    </FieldLabel>
                    <Input
                      id={`${id}-flag`}
                      name="flag"
                      defaultValue={selectedAps?.flag}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-timeZone`}>
                      {m.aps_field_time_zone()}
                    </FieldLabel>
                    <Input
                      id={`${id}-timeZone`}
                      name="timeZone"
                      defaultValue={selectedAps?.timeZone ?? ""}
                      placeholder="Asia/Dubai"
                      aria-describedby={`${id}-timeZone-help`}
                      className="font-mono"
                      required
                    />
                    <FieldDescription
                      id={`${id}-timeZone-help`}
                      className="text-xs"
                    >
                      {m.aps_time_zone_help()}
                    </FieldDescription>
                  </Field>
                </div>
              </FieldSet>
              <FieldSet disabled={busy}>
                <FieldLegend variant="label" className="font-semibold">
                  {m.aps_section_configuration()}
                </FieldLegend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${id}-parkingSpaces`}>
                      {m.aps_field_parking_spaces()}
                    </FieldLabel>
                    <Input
                      id={`${id}-parkingSpaces`}
                      type="number"
                      name="parkingSpaces"
                      defaultValue={selectedAps?.parkingSpaces}
                      className="tabular-nums"
                      required
                    />
                  </Field>
                  <Field
                    orientation="horizontal"
                    className="items-center sm:pt-6"
                  >
                    <Checkbox
                      id={`${id}-notifications`}
                      name="notifications"
                      disabled={busy}
                      defaultChecked={selectedAps?.notifications}
                    />
                    <FieldLabel
                      htmlFor={`${id}-notifications`}
                      className="font-normal"
                    >
                      {m.aps_field_notifications()}
                    </FieldLabel>
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </div>
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (!busy && !submitted.current) setOpen(false)
              }}
            >
              {m.cancel()}
            </Button>
            <Button type="submit" disabled={busy} aria-busy={busy}>
              {busy && (
                <Spinner
                  aria-hidden="true"
                  className="motion-reduce:animate-none"
                />
              )}
              {busy ? m.aps_saving() : m.aps_save()}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
