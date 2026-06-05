import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  // FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { m } from "@paraglide/messages.js";

export function ApsForm({ action, fetcher, open, setOpen, selectedAps }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{m.aps_action_add()}</DialogTitle>
          <DialogDescription>
            {m.aps_action_add_description()}
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4 pb-4">
            <FieldSet>
              <FieldGroup>
                <input name="action" value={action} type="hidden" />
                <Field>
                  <FieldLabel htmlFor="company">
                    {m.aps_field_company()}
                  </FieldLabel>
                  <Input
                    name="company"
                    defaultValue={selectedAps?.company}
                    required
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel htmlFor="country">
                      {m.aps_field_country()}
                    </FieldLabel>
                    <Input
                      name="country"
                      defaultValue={selectedAps?.country}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="flag">{m.aps_field_flag()}</FieldLabel>
                    <Input
                      name="flag"
                      defaultValue={selectedAps?.flag}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="city">{m.aps_field_city()}</FieldLabel>
                    <Input
                      name="city"
                      defaultValue={selectedAps?.city}
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">{m.aps_field_name()}</FieldLabel>
                  <Input
                    name="name"
                    defaultValue={selectedAps?.name}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ns">{m.aps_field_ns()}</FieldLabel>
                  <Input name="ns" defaultValue={selectedAps?.ns} required />
                </Field>
                <div className="grid grid-cols-2 gap-6 items-start justify-between">
                  <Field>
                    <FieldLabel htmlFor="parkingSpaces">
                      {m.aps_field_parking_spaces()}
                    </FieldLabel>
                    <Input
                      type="number"
                      name="parkingSpaces"
                      defaultValue={selectedAps?.parkingSpaces}
                      required
                    />
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      name="notifications"
                      defaultChecked={selectedAps?.notifications}
                    />
                    <FieldLabel htmlFor="notifications" className="font-normal">
                      {m.aps_field_notifications()}
                    </FieldLabel>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
            {fetcher.state !== "idle" && <p>Saving...</p>}
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
