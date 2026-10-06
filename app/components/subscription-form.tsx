import { useState, useEffect } from "react"
import type { FetcherWithComponents } from "react-router"
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
import type { Aps } from "~/lib/aps.server"
import type { Subscription } from "~/lib/subscription.server"

interface SubscriptionFormProps {
  action: "create" | "update"
  aps: Pick<Aps, "ns" | "name" | "company">[]
  fetcher: Pick<FetcherWithComponents<unknown>, "Form" | "state">
  open: boolean
  setOpen: (open: boolean) => void
  selectedSubscription?: Omit<Subscription, "_id">
}

export function SubscriptionForm({
  action,
  aps,
  fetcher,
  open,
  setOpen,
  selectedSubscription,
}: SubscriptionFormProps) {
  const [checkedState, setCheckedState] = useState<boolean[]>(() =>
    aps.map(() => false)
  )

  const [company, setCompany] = useState("Sotefin")

  useEffect(() => {
    const updatedCheckedState = checkedState.map(
      (item, position) =>
        company === aps[position].company || company === "Sotefin"
    )
    setCheckedState(updatedCheckedState)
  }, [company])

  const handleCheckboxChange = (index: number) => {
    const updatedCheckedState = checkedState.map((item, position) =>
      index === position ? !item : item
    )
    setCheckedState(updatedCheckedState)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {action === "create"
              ? m.subscription_action_add()
              : m.subscription_action_update()}
          </DialogTitle>
          <DialogDescription>
            {action === "create"
              ? m.subscription_action_add_description()
              : m.subscription_action_update_description()}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
          <input name="action" value={action} type="hidden" />
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    defaultValue={selectedSubscription?.email}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="company">
                    {m.subscription_field_company()}
                  </FieldLabel>
                  <Input
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    defaultValue={selectedSubscription?.company}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">
                    {m.subscription_field_role()}
                  </FieldLabel>
                  <Select
                    id="role"
                    name="role"
                    defaultValue={selectedSubscription?.role || "service"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(roles).map((role) => (
                          <SelectItem value={role} key={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldSeparator />
              <FieldDescription>
                {m.subscription_field_selected_aps_description()}
              </FieldDescription>
              <FieldGroup className="grid grid-cols-2 gap-3">
                {aps.map((aps, index) => (
                  <Field orientation="horizontal" key={aps.ns}>
                    <Checkbox
                      id={aps.ns}
                      name="aps"
                      value={aps.ns}
                      checked={checkedState[index]}
                      onCheckedChange={() => handleCheckboxChange(index)}
                    />
                    <FieldLabel htmlFor={aps.ns} className="font-normal">
                      {aps.name}
                    </FieldLabel>
                  </Field>
                ))}
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
