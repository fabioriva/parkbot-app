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
import { Success } from "~/components/success-alert";
import { auth } from "~/lib/auth.server";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/password-reset";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const newPassword = formData.get("newPassword");
    const token = formData.get("token");
    const data = await auth.api.resetPassword({
      body: {
        newPassword, // required
        token, // required
      },
    });
    if (data) {
      return { success: true };
    }
    return { message: "Password changed!!!" };
  } catch (error) {
    return { message: error?.body?.message };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const token = searchParams.get("token");
  if (!token) {
    throw data("Forbidden", { status: 403 });
  }
  return { token };
}

export default function PasswordReset({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.password_reset_card_title()}</CardTitle>
        <CardDescription>{m.password_reset_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        {actionData?.success && (
          <Success
            description={m.password_reset_success_description()}
            title={m.password_reset_success_title()}
          />
        )}
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="newPassword"
                // autoComplete="current-password"
              />
            </Field>
            <input type="hidden" name="token" value={loaderData?.token} />
            <Field>
              <Submit
                action="/password-reset"
                title={m.password_reset_confirm()}
              />
              {actionData ? (
                <FieldError>{actionData?.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
