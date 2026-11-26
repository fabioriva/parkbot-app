import { SearchIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { roles } from "~/lib/roles"
import { m } from "@paraglide/messages.js"
import type { Aps } from "~/lib/aps.server"
import type { Subscription } from "~/lib/subscription.server"

export type EditableSubscription = Omit<Subscription, "_id">
export interface SubscriptionMutationFeedback {
  success?: string
  error?: string
  action?: string
}
export type SubscriptionMutationFetcher = Pick<
  FetcherWithComponents<SubscriptionMutationFeedback>,
  "Form" | "state" | "data"
>

interface SubscriptionFormProps {
  action: "create" | "update"
  aps: Pick<Aps, "ns" | "name" | "company">[]
  fetcher: SubscriptionMutationFetcher
  open: boolean
  setOpen: (open: boolean) => void
  selectedSubscription?: EditableSubscription
}

export function SubscriptionForm(props: SubscriptionFormProps) {
  if (!props.open) return null
  return (
    <SubscriptionEditor
      key={`${props.action}:${props.selectedSubscription?.email ?? ""}`}
      {...props}
    />
  )
}

function SubscriptionEditor({
  action,
  aps,
  fetcher,
  open,
  setOpen,
  selectedSubscription,
}: SubscriptionFormProps) {
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
  const [company, setCompany] = useState(
    selectedSubscription?.company ?? "Sotefin"
  )
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => [
    ...new Set(selectedSubscription?.aps ?? []),
  ])
  const [search, setSearch] = useState("")
  const knownSystems = new Map(aps.map((item) => [item.ns, item]))
  const missingSystems = [...new Set(selectedSubscription?.aps ?? [])]
    .filter((ns) => !knownSystems.has(ns))
    .map((ns) => ({ ns, name: ns, company: "" }))
  const allSystems = [...knownSystems.values(), ...missingSystems].sort(
    (a, b) => a.name.localeCompare(b.name)
  )
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
  const query = normalize(search.trim())
  const visibleSystems = allSystems.filter(
    (item) =>
      !query ||
      [item.name, item.ns, item.company].some((value) =>
        normalize(value).includes(query)
      )
  )
  const roleOptions = Object.keys(roles).map((value) => ({
    value,
    label: value,
  }))
  const selectSystem = (ns: string, checked: boolean) => {
    if (busy) return
    setSelectedSystems((current) =>
      checked
        ? current.includes(ns)
          ? current
          : [...current, ns]
        : current.filter((value) => value !== ns)
    )
  }

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
            {editing
              ? m.subscription_action_update()
              : m.subscription_action_add()}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? m.subscription_action_update_description()
              : m.subscription_action_add_description()}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          className="flex min-h-0 flex-col"
          aria-busy={busy}
          onSubmit={(event) => {
            if (busy || submitted.current) {
              event.preventDefault()
              return
            }
            submitted.current = true
          }}
        >
          <input type="hidden" name="action" value={action} />
          {selectedSystems.map((ns) => (
            <input type="hidden" name="aps" value={ns} key={ns} />
          ))}
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
                  {m.subscription_section_details()}
                </FieldLegend>
                <Field>
                  <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    defaultValue={selectedSubscription?.email}
                    readOnly={editing}
                    aria-describedby={editing ? `${id}-email-help` : undefined}
                    className="read-only:bg-muted/50"
                    required
                  />
                  {editing && (
                    <FieldDescription
                      id={`${id}-email-help`}
                      className="text-xs"
                    >
                      {m.subscription_email_readonly_help()}
                    </FieldDescription>
                  )}
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${id}-company`}>
                      {m.subscription_field_company()}
                    </FieldLabel>
                    <Input
                      id={`${id}-company`}
                      name="company"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-role`}>
                      {m.subscription_field_role()}
                    </FieldLabel>
                    <Select
                      name="role"
                      disabled={busy}
                      items={roleOptions}
                      defaultValue={selectedSubscription?.role || "service"}
                    >
                      <SelectTrigger id={`${id}-role`} className="w-full">
                        <SelectValue
                          placeholder={m.subscription_select_role()}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleOptions.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldSet>
              <FieldSet disabled={busy}>
                <FieldLegend variant="label" className="font-semibold">
                  {m.subscription_assigned_systems()}
                </FieldLegend>
                <FieldDescription id={`${id}-systems-help`} className="text-xs">
                  {m.subscription_assignment_help()}
                </FieldDescription>
                <div className="relative">
                  <FieldLabel htmlFor={`${id}-search`} className="sr-only">
                    {m.subscription_system_search_label()}
                  </FieldLabel>
                  <SearchIcon
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id={`${id}-search`}
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={m.subscription_system_search_placeholder()}
                    className="pl-8"
                  />
                </div>
                <p
                  role="status"
                  className="text-xs text-muted-foreground tabular-nums"
                >
                  {m.subscription_selected_count({
                    count: selectedSystems.length,
                  })}
                </p>
                {visibleSystems.length ? (
                  <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto p-1 sm:grid-cols-2">
                    {visibleSystems.map((item) => {
                      const checkboxId = `${id}-aps-${encodeURIComponent(item.ns)}`
                      return (
                        <FieldLabel
                          key={item.ns}
                          htmlFor={checkboxId}
                          className="min-w-0 cursor-pointer"
                        >
                          <Field
                            orientation="horizontal"
                            className="min-w-0 items-center"
                          >
                            <Checkbox
                              id={checkboxId}
                              value={item.ns}
                              disabled={busy}
                              checked={selectedSystems.includes(item.ns)}
                              onCheckedChange={(checked) =>
                                selectSystem(item.ns, checked)
                              }
                              aria-describedby={`${id}-systems-help`}
                              className="self-center"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium break-words">
                                {item.name}
                              </p>
                              <p className="mt-0.5 font-mono text-xs font-normal break-all text-muted-foreground">
                                {item.ns}
                              </p>
                              <p className="mt-1 text-xs font-normal break-words text-muted-foreground">
                                {knownSystems.has(item.ns)
                                  ? item.company
                                  : m.subscription_system_unavailable()}
                              </p>
                            </div>
                          </Field>
                        </FieldLabel>
                      )
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
                    {m.subscription_systems_no_results()}
                  </p>
                )}
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
              {busy ? m.subscription_saving() : m.subscription_save()}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
