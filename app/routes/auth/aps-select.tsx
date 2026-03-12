import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import { findSubscribedApsList, findSubscription } from "~/lib/db.server";
import type { Route } from "./+types/aps-select";

export async function action({ request }: Route.ActionArgs) {
  // TODO: trycatch
  const formData = await request.formData();
  const aps = formData.get("aps");
  const data = await auth.api.updateUser({
    body: {
      aps, // TODO: import Aps interface????????????????????????????????
      // image: "https://example.com/image.jpg",
      // name: "John Doe",
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
    if (!user.twoFactorEnabled) {
      return redirect("/2fa-setup");
    }
    const subscription = await findSubscription(user?.email);
    const aps = await findSubscribedApsList(subscription?.aps);
    return aps;
  } catch (error) {
    console.log("getSession error:", error);
  }
}

export default function ApsSelect({ loaderData }: Route.LoaderArgs) { 
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("apsSelect.cardTitle")}</CardTitle>
        <CardDescription>{t("apsSelect.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <RadioGroup defaultValue={loaderData[0].ns} name="aps">
              {loaderData.map(({ city, country, name, ns }, key) => (
                <FieldLabel htmlFor={ns} key={key}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="capitalize">{name}</FieldTitle>
                      <FieldDescription>
                        Located in {city}, {country}.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={ns} id={ns} />
                  </Field>
                </FieldLabel>
              ))}
              <Field>
                <Submit action="/aps-select" title={t("apsSelect.submit")} />
              </Field>
            </RadioGroup>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
