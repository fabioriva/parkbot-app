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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import {
  findSubscription,
  updateSubscription,
} from "~/lib/subscription.server";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/signup";

export async function action({ context, request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const firstName = formData.get("first-name");
    const lastName = formData.get("last-name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    const subscription = await findSubscription(email);
    if (subscription === null) {
      return { error: m.signup_not_subscribed() };
    }
    if (password && password !== confirm) {
      return { error: m.signup_password_match() };
    }
    const { headers, response } = await auth.api.signUpEmail({
      // asResponse: true,
      returnHeaders: true,
      body: {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: subscription.role,
        callbackURL: "/aps-select", // optional
        // image: "https://github.com/fabioriva.png", // optional
      },
    });
    const result = await updateSubscription(email);
    return redirect(`/verify-email?email=${email}`, { headers });
  } catch (error) {
    return { error: error?.body?.message };
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.signup_card_title()}</CardTitle>
        <CardDescription>{m.signup_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <FieldGroup className="grid max-w-sm grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first-name">
                  {m.signup_first_name()}
                </FieldLabel>
                <Input name="first-name" placeholder="John" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">
                  {m.signup_last_name()}
                </FieldLabel>
                <Input name="last-name" placeholder="Doe" required />
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
                {m.signup_email_field_description()}
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
                {m.signup_password_field_description()}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">Conferma Password</FieldLabel>
              <Input
                type="password"
                name="confirm"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <Submit action="/signup" title={m.signup()} />
              {actionData ? <FieldError>{actionData.error}</FieldError> : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {m.signup_registered()}{" "}
          <a href="/signin" className="underline underline-offset-4">
            {m.signup_signin_link()}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
