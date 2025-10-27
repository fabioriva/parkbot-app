import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import SubmitFormButton from "~/components/submit-form-button";
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
  // FieldError,
  FieldGroup,
  FieldLabel,
  // FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { getApsFromNs } from "~/lib/aps.server";
import { getSession, setSessionApsId } from "~/lib/session.server";
import { getUserAps } from "~/lib/user.server";

import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
  const { session, user } = await getSession(request);
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup");
  }
  if (!session.twoFactorVerified) {
    return redirect("/2fa/authentication");
  }
  const userAps = await getUserAps(user.id); // _id.toString());
  const apsList = await getApsFromNs(userAps);
  return apsList;
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const ns = formData.get("ns");
  // console.log(formData, ns);
  const { session, user } = await getSession(request);
  await setSessionApsId(session?.id, ns);
  return redirect(`/aps/${ns}/dashboard`);
}

export default function SelectAps({ loaderData }: Route.LoaderArgs) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("selectAps.cardTitle")}</CardTitle>
        <CardDescription>{t("selectAps.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <RadioGroup defaultValue={loaderData[0].ns} name="ns">
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
                <SubmitFormButton action="/select-aps" title="Confirm Aps" />
              </Field>
            </RadioGroup>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
