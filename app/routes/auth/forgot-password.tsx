import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
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
import {
  ForgotPasswordSchema,
  validateForm,
} from "~/lib/form-validation.server";
import {
  createPasswordResetSession,
  invalidateUserPasswordResetSessions,
  sendPasswordResetEmail,
  getPasswordResetSessionCookie,
  setPasswordResetSessionCookie,
} from "~/lib/password-reset.server";
import { generateSessionToken } from "~/lib/session.server";
import { getUserFromEmail } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/forgot-password";

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, ForgotPasswordSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const email = formData.get("email");
    const user = await getUserFromEmail(email);
    if (user === null) {
      return {
        message: i18n.t("auth.accountNotFound"),
      };
    }
    await invalidateUserPasswordResetSessions(user.id);
    const sessionToken = generateSessionToken();
    const session = await createPasswordResetSession(
      sessionToken,
      user.id,
      user.email
    );
    sendPasswordResetEmail(session.email, session.code);
    const sessionCookie = await getPasswordResetSessionCookie(request);
    sessionCookie.token = sessionToken;
    const cookie = await setPasswordResetSessionCookie(sessionCookie, {
      expires: session?.expiresAt,
    });
    return redirect("/reset/verify", {
      headers: { "Set-Cookie": cookie },
    });
  }
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">
          {t("forgotPassword.cardTitle")}
        </CardTitle>
        <CardDescription>{t("forgotPassword.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                // type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="mail@example.com"
                // required
              />
            </div>
            <SubmitFormButton
              action="/forgot-password"
              title={t("submitButton")}
            />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          {t("forgotPassword.loginLink")}{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
