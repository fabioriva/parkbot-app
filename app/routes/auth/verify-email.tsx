import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldError, FieldGroup } from "~/components/ui/field";
import { authClient } from "~/lib/auth.client";
import type { Route } from "./+types/verify-email";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const email = searchParams.get("email");
  return { email };
}

export default function VerifyEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const [emailSent, setEmailSent] = useState(false);
  const resendEmail = async () => {
    const { data, error } = await authClient.sendVerificationEmail({
      email: loaderData.email,
      callbackURL: "/aps-select", // The redirect URL after verification
    });
    console.log(data, error);
    setEmailSent(data?.status);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("verifyEmail.cardTitle")}</CardTitle>
        <CardDescription>
          {t("verifyEmail.cardDescription")}{" "}
          <span className="text-blue-500">
            {loaderData?.email ? loaderData.email : "mail@example.com"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <p>
              {t("verifyEmail.cardContent")}
            </p>
          </Field>
          <Field>
            <Button onClick={resendEmail}>{t("verifyEmail.resendButton")}</Button>
            {emailSent ? (
              <FieldError>{"We have sent you an email"}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
