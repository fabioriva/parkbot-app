import { Form, redirect } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import { aps } from "~/lib/aps";
// import { findSubscribedApsList } from "~/lib/aps.server";
import { findSubscription } from "~/lib/subscription.server";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/aps-select";

export async function action({ request }: Route.ActionArgs) {
  // TODO: trycatch
  const formData = await request.formData();
  const aps = formData.get("aps");
  const data = await auth.api.updateUser({
    body: {
      aps,
    },
    headers: await request.headers,
  });
  if (data.status) {
    return redirect(`/aps/${aps}/dashboard`);
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const data = await auth.api.getSession({
      headers: await request.headers,
    });
    if (!data) {
      return redirect("/");
    }
    const { session, user } = data;
    if (process.env.TWO_FACTOR === "enabled" && !user.twoFactorEnabled) {
      return redirect("/2fa-setup");
    }
    const subscription = await findSubscription(user?.email);
    // const aps = await findSubscribedApsList(subscription?.aps);
    // return aps;
    // return await findSubscribedApsList(subscription?.aps);
    return aps.filter((a) => subscription?.aps.includes(a.ns));
  } catch (error) {
    console.log("getSession error:", error);
  }
}

export default function ApsSelect({ loaderData }: Route.LoaderArgs) {
  return (
    <Card>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">{m.aps_card_title()}</FieldLegend>
              <FieldDescription>{m.aps_card_description()}</FieldDescription>
              <RadioGroup defaultValue={loaderData[0].ns} name="aps">
                {loaderData.map(
                  ({ city, country, flag, name, ns, parkingSpaces }, key) => (
                    <FieldLabel htmlFor={ns} key={key}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>{name}</FieldTitle>
                          <FieldDescription>
                            {m.aps_location({ city, country, flag })}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value={ns} id={ns} />
                      </Field>
                    </FieldLabel>
                  ),
                )}
              </RadioGroup>
              <Field>
                <Submit action="/aps-select" title={m.confirm()} />
              </Field>
            </FieldSet>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
