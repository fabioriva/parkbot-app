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

import type { Route } from "./+types/two-factor-verify";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const totp = formData.get("totp");
    const response = await auth.api.verifyTOTP({
      asResponse: true,
      body: {
        code: totp,
        // trustDevice: true, // optional, defaults to false
      },
      headers: await request.headers,
    });
    if (response.ok) {
      const headers = new Headers(response.headers);
      // console.log(headers);
      return redirect("/aps-select", { headers });
    } else {
      return { message: response.statusText };
    }
  } catch (error) {
    // console.log(error);
    return { message: error?.body?.message };
  }
}

export default function TwoFactorVerify({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.two_factor_verify_card_title()}</CardTitle>
        <CardDescription>
          {m.two_factor_verify_card_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="totp">
                {m.two_factor_verify_totp()}
              </FieldLabel>
              <Input type="totp" name="totp" required />
            </Field>
            <Field>
              <Submit
                action="/2fa-verify"
                title={m.two_factor_verify_submit()}
              />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          <a className="underline underline-offset-4" href="/2fa-reset">
            {m.two_factor_verify_link()}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
