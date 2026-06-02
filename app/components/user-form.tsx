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
import { m } from "@paraglide/messages.js";

export function UserForm() {
  return (
    <FieldSet>
      <FieldGroup>
        <input name="action" value="create" type="hidden" />
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="first-name">
              {m.signup_first_name()}
            </FieldLabel>
            <Input name="first-name" placeholder="John" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="last-name">{m.signup_last_name()}</FieldLabel>
            <Input name="last-name" placeholder="Doe" required />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
