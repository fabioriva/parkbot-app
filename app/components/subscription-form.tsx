import { useState, useEffect } from "react";
import { Form, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
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
import { CompanySelect } from "~/components/company-select";
import { roles } from "~/lib/roles";

export function SubscriptionForm({ aps, user }) {
  const actionData = useActionData();

  const [checkedState, setCheckedState] = useState(
    new Array(aps.length).fill(false),
  );

  const handleCheckboxChange = (aps, index) => {
    // console.log(aps, index);
    const updatedCheckedState = checkedState.map((item, position) =>
      index === position ? !item : item,
    );
    setCheckedState(updatedCheckedState);
  };

  const [company, setCompany] = useState("Sotefin");

  useEffect(() => {
    const updatedCheckedState = checkedState.map(
      (item, position) =>
        company === aps[position].company || company === "Sotefin",
    );
    setCheckedState(updatedCheckedState);
  }, [company]);

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
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <CompanySelect company={company} setCompany={setCompany} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">User's role</FieldLabel>
                  <Select id="role" name="role" defaultValue="service">
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
            </FieldSet>
            <FieldSet>
              <FieldSeparator />
              {/* <FieldLegend variant="label">Aps list:</FieldLegend> */}
              <FieldDescription>
                Select the systems you want to assign to this subscription.
              </FieldDescription>
              <FieldGroup className="grid grid-cols-2 gap-3">
                {aps.map((aps, index) => (
                  <Field orientation="horizontal" key={aps.ns}>
                    <Checkbox
                      id={aps.ns}
                      name="aps"
                      value={aps.ns}
                      // defaultChecked={aps.company === company}
                      checked={checkedState[index]}
                      onCheckedChange={() => handleCheckboxChange(aps, index)}
                    />
                    <FieldLabel htmlFor={aps.ns} className="font-normal">
                      {aps.name}
                    </FieldLabel>
                  </Field>
                ))}
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
