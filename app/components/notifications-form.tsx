import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
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
  // FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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

export function NotificationsForm({
  action,
  fetcher,
  open,
  setOpen,
  selectedRecipient,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
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
        <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
          <input name="action" value={action} type="hidden" />
          <input name="id" value={selectedRecipient?._id} type="hidden" />
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    defaultValue={selectedRecipient?.email}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="name">
                    {/* {m.signup_first_name()} */}
                    Description
                  </FieldLabel>
                  <Input
                    name="name"
                    placeholder="Full or ompany name"
                    defaultValue={selectedRecipient?.name || ""}
                    // required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="locale">
                    {/* {m.signup_last_name()} */}
                    Locale
                  </FieldLabel>
                  <Input
                    name="locale"
                    placeholder="Preferred locale"
                    defaultValue={selectedRecipient?.locale || "en"}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">
                    {/* {m.signup_last_name()} */}
                    Phone
                  </FieldLabel>
                  <Input
                    name="phone"
                    placeholder="+123456"
                    defaultValue={selectedRecipient?.phone || ""}
                    // required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save changes</Button>
            {fetcher.state !== "idle" && <p>Saving...</p>}
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
