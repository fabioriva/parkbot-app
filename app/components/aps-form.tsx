import { Form, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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

export function ApsForm({ user }) {
  const actionData = useActionData();
  return (
    <Card className="w-full max-w-md">
      <Form action={`/aps/${user.aps}/user/aps`} method="post">
        <FieldGroup>
          <CardContent className="space-y-6">
            <FieldSet>
              <FieldLegend>Add aps</FieldLegend>
              <FieldDescription>Add new aps</FieldDescription>
              <FieldGroup>
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
                <div className="grid grid-cols-2 gap-10">
                  <Field>
                    <FieldLabel htmlFor="parkingSpaces">
                      Parking Spaces
                    </FieldLabel>
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
                      // value={aps.ns}
                      defaultChecked
                    />
                    <FieldLabel htmlFor="notifications" className="font-normal">
                      Enable notifications
                    </FieldLabel>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <Field orientation="vertical">
              <Button className="w-full" type="submit">
                Submit
              </Button>
              {actionData ? (
                <FieldError>{actionData?.message}</FieldError>
              ) : null}
            </Field>
          </CardContent>
        </FieldGroup>
      </Form>
    </Card>
  );
}
