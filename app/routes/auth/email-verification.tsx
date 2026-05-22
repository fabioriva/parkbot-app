import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldGroup } from "~/components/ui/field";
import { authClient } from "~/lib/auth";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/verify-email";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const email = searchParams.get("email");
  return { email };
}

export default function EmailVerification({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const [emailSent, setEmailSent] = useState(false);
  const resendEmail = async () => {
    const { data, error } = await authClient.sendVerificationEmail({
      email: loaderData.email,
      callbackURL: "/aps-select", // The redirect URL after verification
    });
    setEmailSent(data?.status);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.auth_email_verification_card_title()}</CardTitle>
        <CardDescription>
          {m.auth_email_verification_card_description()}{" "}
          <span className="text-blue-500">{loaderData?.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <p>{m.auth_email_verification_card_content()}</p>
          </Field>
          <Field>
            <Button onClick={resendEmail}>{m.auth_email_resend()}</Button>
            {emailSent ? <p>{"We have sent you an email"}</p> : null}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
