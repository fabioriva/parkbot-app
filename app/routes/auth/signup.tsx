import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import SubmitFormButton from "~/components/submitFormButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { checkEmailAvailability } from "~/lib/email.server";
import {
  createEmailVerificationRequest,
  getEmailVerificationCookie,
  sendVerificationEmail,
  setEmailVerificationCookie,
} from "~/lib/email-verification.server";
import { SignupSchema, validateForm } from "~/lib/form-validation.server";
import { verifyPasswordStrength } from "~/lib/password.server";
import {
  createSession,
  generateSessionToken,
  getSession,
  getSessionCookie,
  setSessionCookie,
} from "~/lib/session.server";
import { createUser } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { SessionFlags } from "~/lib/session.server";
import type { Route } from "./+types/signup";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getSession(request);
  // ...
}

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, SignupSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    const emailAvailable = await checkEmailAvailability(email);
    if (!emailAvailable) {
      return { message: i18n.t("auth.emailUsed") };
    }
    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) {
      return { message: i18n.t("auth.passwordWeak") };
    }
    if (confirm !== password) {
      return { message: i18n.t("auth.passwordDiff") };
    }
    const user = await createUser(email, username, password);
    const emailVerificationRequest = await createEmailVerificationRequest(
      user.id,
      user.email
    );
    sendVerificationEmail(
      emailVerificationRequest.email,
      emailVerificationRequest.code
    );
    const emailVerificationCookie = await getEmailVerificationCookie(request);
    emailVerificationCookie.id = emailVerificationRequest.id;
    const sessionToken = generateSessionToken();
    const sessionFlags: SessionFlags = {
      twoFactorVerified: false,
    };
    const session = await createSession(sessionToken, user.id, sessionFlags);
    const sessionCookie = await getSessionCookie(request);
    sessionCookie.token = sessionToken;
    return redirect("/2fa/setup", {
      headers: [
        [
          "Set-Cookie",
          await setEmailVerificationCookie(emailVerificationCookie, {
            expires: emailVerificationRequest?.expiresAt,
          }),
        ],
        [
          "Set-Cookie",
          await setSessionCookie(sessionCookie, {
            expires: session?.expiresAt,
          }),
        ],
      ],
    });
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("signup.cardTitle")}</CardTitle>
        <CardDescription>
          <p>{t("signup.cardDescription")}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                // minLength={4}
                // maxLength={31}
                // placeholder="Username"
                // required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="mail@example.com"
                // required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                // placeholder="Enter password"
                // required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirm">{t("signup.confirmLabel")}</Label>
              <Input
                type="password"
                name="confirm"
                id="confirm"
                autoComplete="current-password"
                // placeholder="Confirm password"
                // required
              />
            </div>
            <SubmitFormButton action="/signup" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
