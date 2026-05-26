import { useState, useEffect } from "react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/password-forgot";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    if (!email) {
      return { message: m.password_forgot_email_not_valid() };
    }
    const data = await auth.api.requestPasswordReset({
      body: {
        email, // required
        redirectTo: "/password-reset", // required
      },
    });
    return { success: true };
  } catch (error) {
    return { message: error?.body?.message };
  }
}

export default function PasswordForgot({ actionData }: Route.ComponentProps) {
  const [emailSent, setEmailSent] = useState(false);
  useEffect(() => setEmailSent(actionData?.success), [actionData?.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.password_forgot_card_title()}</CardTitle>
        <CardDescription>
          {m.password_forgot_card_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="mail@example.com"
              />
            </Field>
            <Field>
              <Submit
                action="/password-forgot"
                title={m.password_forgot_send_link()}
              />
              {emailSent ? <p>{m.auth_email_sent()}</p> : null}
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {m.password_forgot_signin_link()}{" "}
          <a href="/signin" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
