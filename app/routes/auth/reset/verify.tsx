import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import SubmitFormButton from "~/components/submitFormButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { VerifyMailSchema, validateForm } from "~/lib/form-validation.server";
import {
  getPasswordResetSession,
  setPasswordResetSessionAsEmailVerified,
} from "~/lib/password-reset.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/verify-email";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = await getPasswordResetSession(request);
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (session.emailVerified) {
    if (!session.twoFactorVerified) {
      return redirect("/reset-password/2fa");
    }
    return redirect("/reset-password/password");
  }
  return { email: session.email };
}

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, VerifyMailSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const { session } = await getPasswordResetSession(request);

    const code = formData.get("code");
    if (session.code !== code) {
      return { message: i18n.t("auth.codeInvalid") };
    }
    await setPasswordResetSessionAsEmailVerified(session.id);
    // const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(
    //   session.userId,
    //   session.email
    // );
    // if (!emailMatches) {
    //   return {
    //     message: "Please restart the process",
    //   };
    // }
    return redirect("/reset-password/2fa");
  }
}

export default function ResetPasswordVerifyEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("verifyEmail.cardTitle")}</CardTitle>
        <CardDescription>
          {t("verifyEmail.cardDescription")}{" "}
          <span className="underline underline-offset-4">
            {loaderData?.email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">{t("verifyEmail.codeLabel")}</Label>
              <Input
                type="text"
                name="code"
                id="code"
                // required
              />
            </div>
            <SubmitFormButton
              action="/reset-password/verify-email"
              title={t("submitButton")}
            />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
