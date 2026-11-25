import { useEffect, useId, useRef } from "react"
import type { FetcherWithComponents } from "react-router"
import { Button } from "~/components/ui/button"
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
import { locales } from "@paraglide/runtime.js"
import { m } from "@paraglide/messages.js"

export interface NotificationRecipient {
  _id: string
  email: string
  name?: string | null
  locale?: string | null
  phone?: string | null
}
interface NotificationFeedback {
  success?: string
  error?: string
  action?: string
}
interface NotificationsFormProps {
  action: "create" | "update"
  fetcher: Pick<
    FetcherWithComponents<NotificationFeedback>,
    "Form" | "state" | "data"
  >
  open: boolean
  setOpen: (open: boolean) => void
  selectedRecipient?: NotificationRecipient
}

export function NotificationsForm({
  action,
  fetcher,
  open,
  setOpen,
  selectedRecipient,
}: NotificationsFormProps) {
  const id = useId()
  const submitted = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)
  const busy = fetcher.state !== "idle"
  useEffect(() => {
    if (!open || !submitted.current || busy) return
    if (fetcher.data?.success) {
      submitted.current = false
      setOpen(false)
    } else if (fetcher.data?.error) {
      errorRef.current?.focus()
    }
  }, [open, busy, fetcher.data, setOpen])
  const optional = (
    <span className="text-xs font-normal text-muted-foreground">
      {m.notifications_optional()}
    </span>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) setOpen(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {action === "create"
              ? m.notifications_action_add()
              : m.notifications_action_update()}
          </DialogTitle>
          <DialogDescription>
            {action === "create"
              ? m.notifications_action_add_description()
              : m.notifications_action_update_description()}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          onSubmit={(event) => {
            if (busy) {
              event.preventDefault()
              return
            }
            submitted.current = true
          }}
          aria-busy={busy}
        >
          <input name="action" value={action} type="hidden" />
          <div className="max-h-[55vh] overflow-y-auto px-1 pb-4">
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
            <FieldSet disabled={busy}>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor={`${id}-email`}>
                    Email <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id={`${id}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="technical@example.com"
                    defaultValue={selectedRecipient?.email}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-name`}>
                    {m.notifications_field_name()} {optional}
                  </FieldLabel>
                  <Input
                    id={`${id}-name`}
                    name="name"
                    autoComplete="name"
                    placeholder={m.notifications_field_name()}
                    defaultValue={selectedRecipient?.name || ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-locale`}>
                    {m.notifications_field_locale()}
                  </FieldLabel>
                  <Select
                    name="locale"
                    disabled={busy}
                    defaultValue={selectedRecipient?.locale || "en"}
                  >
                    <SelectTrigger
                      id={`${id}-locale`}
                      className="w-full uppercase"
                    >
                      <SelectValue
                        placeholder={m.notifications_select_language()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {locales.map((locale) => (
                          <SelectItem
                            className="uppercase"
                            value={locale}
                            key={locale}
                          >
                            {locale}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-phone`}>
                    {m.notifications_field_phone()} {optional}
                  </FieldLabel>
                  <Input
                    id={`${id}-phone`}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+1234567890"
                    defaultValue={selectedRecipient?.phone || ""}
                  />
                </Field>
              </FieldGroup>
              <FieldDescription className="text-xs">
                {m.notifications_required_hint()}
              </FieldDescription>
            </FieldSet>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
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
              {busy ? m.notifications_saving() : m.notifications_save()}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
