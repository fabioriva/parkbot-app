import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
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
import { verifyPasswordStrength } from "~/lib/password.server";
import {
  getPasswordResetSession,
  invalidateUserPasswordResetSessions,
  getPasswordResetSessionCookie,
  setPasswordResetSessionCookie,
} from "~/lib/password-reset.server";
import { invalidateUserSessions } from "~/lib/session.server";
import { updateUserPassword } from "~/lib/user.server";

import type { Route } from "./+types/password";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getPasswordResetSession(request);
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (!session.emailVerified) {
    return redirect("/reset-password/verify-email");
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/reset-password/2fa");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session: passwordResetSession, user } =
    await getPasswordResetSession(request);
  if (passwordResetSession === null) {
    return {
      message: "Not authenticated",
    };
  }
  if (!passwordResetSession.emailVerified) {
    return {
      message: "Forbidden",
    };
  }
  if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
    return {
      message: "Forbidden",
    };
  }
  const formData = await request.formData();
  const password = formData.get("password");
  if (password === "") {
    return {
      message: i18n.t("login.action.mesgOne"),
    };
  }
  if (typeof password !== "string") {
    return {
      message: i18n.t("login.action.mesgTwo"),
    };
  }
  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) {
    return {
      message: i18n.t("signup.action.mesgSix"),
    };
  }
  await invalidateUserPasswordResetSessions(passwordResetSession.userId);
  await invalidateUserSessions(passwordResetSession.userId);
  await updateUserPassword(passwordResetSession.userId, password);
  // deletePasswordResetSessionTokenCookie();
  const sessionCookie = await getPasswordResetSessionCookie(request);
  const cookie = await setPasswordResetSessionCookie(sessionCookie, {
    maxAge: 0,
  });
  // const sessionFlags: SessionFlags = {
  // 	twoFactorVerified: passwordResetSession.twoFactorVerified
  // };
  // const sessionToken = generateSessionToken();
  // const session = createSession(sessionToken, user.id, sessionFlags);
  // setSessionTokenCookie(sessionToken, session.expiresAt);
  return redirect("/aps/test/dashboard");
}

export default function ResetPassword({ actionData }) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("login.cardTitle")}</CardTitle>
        <CardDescription>{t("login.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="password">New password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                // required
              />
            </div>
            <SubmitFormButton action="/login" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
