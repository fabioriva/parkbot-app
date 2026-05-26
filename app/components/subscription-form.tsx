import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  // FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { roles } from "~/lib/roles";

export function SubscriptionForm({ aps, user }) {
  return (
    <Card className="w-full max-w-md">
      <Form action={`/aps/${user.aps}/user/subscription`} method="post">
        <FieldGroup>
          <CardContent className="space-y-6">
            <FieldSet>
              <FieldLegend>Add subscrption</FieldLegend>
              <FieldDescription>Add new subscription</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">User role</FieldLabel>
                  <Select id="role" name="role" defaultValue="service">
                    <SelectTrigger>
                      <SelectValue placeholder="service" />
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
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Aps list:</FieldLegend>
              <FieldDescription>
                Select the systems you want to assign to this subscription.
              </FieldDescription>
              <FieldGroup className="grid grid-cols-2 gap-3">
                {aps.map((aps) => (
                  <Field orientation="horizontal" key={aps.ns}>
                    <Checkbox
                      id={aps.ns}
                      name="aps"
                      value={aps.ns}
                      // defaultChecked
                    />
                    <FieldLabel htmlFor={aps.ns} className="font-normal">
                      {aps.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </CardFooter>
        </FieldGroup>
      </Form>
    </Card>
  );
}
