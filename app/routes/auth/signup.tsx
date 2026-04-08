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
import { findSubscription, updateSubscription } from "~/lib/db.server";
import { getInstance } from "~/middleware/i18next";
import type { Route } from "./+types/signup";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    // const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    const subscription = await findSubscription(email);
    const i18next = getInstance(context);
    if (subscription === null) {
      return { error: i18next.t("signup.errorOne") };
    }
    if (password && password !== confirm) {
      return { error: i18next.t("signup.errorTwo") };
    }
    const { headers, response } = await auth.api.signUpEmail({
      // asResponse: true,
      returnHeaders: true,
      body: {
        name: `${firstName} ${lastName}`, // name || email.split("@")[0],
        email,
        password,
        role: subscription.role,
        // image: "https://github.com/fabioriva.png", // optional
        callbackURL: "/aps-select", // optional
      },
    });
    const result = await updateSubscription(email);
    return redirect(`/verify-email?email=${email}`, { headers });
  } catch (error) {
    console.log("signUpEmail error:\n", error);
    return { error: error?.body?.message };
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
                <FieldLabel htmlFor="first-name">
                  {t("signup.firstLabel")}
                </FieldLabel>
                <Input name="first-name" placeholder="John" required/>
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">
                  {t("signup.lastLabel")}
                </FieldLabel>
                <Input name="last-name" placeholder="Doe" required/>
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="john.doe@example.com"
                required
              />
              <FieldDescription>
                {t("signup.emailDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
              <FieldDescription>
                {t("signup.passwordDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">
                {t("signup.confirmLabel")}
              </FieldLabel>
              <Input
                type="password"
                name="confirm"
                autoComplete="current-password"
                required
              />
              <FieldDescription>
                {t("signup.confirmDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <Submit action="/signup" title={t("signup.submit")} />
              {actionData ? <FieldError>{actionData.error}</FieldError> : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {t("signup.signin")}{" "}
          <a href="/signin" className="underline underline-offset-4">
            {t("signup.signinLink")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
