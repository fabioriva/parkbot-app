import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
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

export function ApsForm() {
  const [checkedState, setCheckedState] = useState(false);

  return (
    <FieldSet>
      <FieldGroup>
        <input name="action" value="create" type="hidden" />
        <Field>
          <FieldLabel htmlFor="company">Company</FieldLabel>
          <Input name="company" placeholder="Company Name" required />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input name="country" placeholder="Country" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="flag">Flag</FieldLabel>
            <Input name="flag" placeholder="Flag" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input name="city" placeholder="City" required />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input name="name" placeholder="Aps Name" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="ns">Namespace</FieldLabel>
          <Input name="ns" placeholder="Namespace" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="parkingSpaces">Parking Spaces</FieldLabel>
          <Input
            type="number"
            name="parkingSpaces"
            placeholder="Nr of parking spaces"
            required
          />
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            name="notifications"
            // value="enabled"
            // defaultChecked
            checked={checkedState}
            onCheckedChange={(value) => setCheckedState(value === true)}
          />
          <FieldLabel htmlFor="notifications" className="font-normal">
            Enable notifications
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
