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

export function ApsForm({ action, aps, fetcher, open, setOpen }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Aps</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <FieldSet>
              <FieldGroup>
                <input name="action" value={action} type="hidden" />
                <Field>
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <Input name="company" defaultValue={aps?.company} required />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      name="country"
                      defaultValue={aps?.country}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="flag">Flag</FieldLabel>
                    <Input name="flag" defaultValue={aps?.flag} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input name="city" defaultValue={aps?.city} required />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input name="name" defaultValue={aps?.name} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ns">Namespace</FieldLabel>
                  <Input name="ns" defaultValue={aps?.ns} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="parkingSpaces">
                    Parking Spaces
                  </FieldLabel>
                  <Input
                    type="number"
                    name="parkingSpaces"
                    defaultValue={aps?.parkingSpaces}
                    required
                  />
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    name="notifications"
                    defaultChecked={aps?.notifications}
                  />
                  <FieldLabel htmlFor="notifications" className="font-normal">
                    Enable notifications
                  </FieldLabel>
                </Field>
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
