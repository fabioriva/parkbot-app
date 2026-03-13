import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import { findSubscription } from "~/lib/db.server";
import type { Route } from "./+types/signup";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    // const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    //
    const subscription = await findSubscription(email);
    if (subscription === null) {
      return { message: "You are not authorised to register!" };
    }
    if (password && password !== confirm) {
      return { message: "Password doesn't match" }; // i18n.t("auth.passwordDiff") };
    }
    const { headers, response } = await auth.api.signUpEmail({
      // asResponse: true,
      returnHeaders: true,
      body: {
        name: `${firstName} ${lastName}`, // name || email.split("@")[0],
        email,
        password,
        role: subscription.role, // ["dashboard", "map", "racks", "tags"],
        image: "https://github.com/fabioriva.png", // optional
        callbackURL: "/aps-select", // optional
      },
    });
    return redirect(`/verify-email?email=${email}`, { headers });
  } catch (error) {
    console.log("signUpEmail error:\n", error);
    return { message: error?.body?.message };
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("signup.cardTitle")}</CardTitle>
        <CardDescription>{t("signup.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <FieldGroup className="grid max-w-sm grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first-name">{t("signup.firstLabel")}</FieldLabel>
              <Input name="first-name" placeholder="John" />
            </Field>
            <Field>
              <FieldLabel htmlFor="last-name">{t("signup.lastLabel")}</FieldLabel>
              <Input name="last-name" placeholder="Doe" />
            </Field>
          </FieldGroup>
            {/* <Field>
              <FieldLabel htmlFor="name">{t("signup.nameLabel")}</FieldLabel>
              <Input type="text" name="name" placeholder="John Doe" />
            </Field> */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="john.doe@example.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
              />
              <FieldDescription>{t("signup.passwordDescription")}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">
                {t("signup.confirmLabel")}
              </FieldLabel>
              <Input
                type="password"
                name="confirm"
                autoComplete="current-password"
              />
            </Field>
            <Field>
              <Submit action="/signup" title={t("signup.submit")} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
