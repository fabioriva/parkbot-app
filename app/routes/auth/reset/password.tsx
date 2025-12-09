import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ResetPasswordSchema,
  validateForm,
} from "~/lib/form-validation.server";
import { verifyPasswordStrength } from "~/lib/password.server";
import {
  getPasswordResetSession,
  invalidateUserPasswordResetSessions,
  getPasswordResetSessionCookie,
  setPasswordResetSessionCookie,
} from "~/lib/password-reset.server";
import {
  invalidateUserSessions,
  createSession,
  generateSessionToken,
  getSessionCookie,
  setSessionCookie,
} from "~/lib/session.server";
import { updateUserPassword } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { SessionFlags } from "~/lib/session.server";
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
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, ResetPasswordSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) {
      return { message: i18n.t("auth.passwordWeak") };
    }
    if (confirm !== password) {
      return { message: i18n.t("auth.passwordDiff") };
    }
    const { session: passwordResetSession, user } =
      await getPasswordResetSession(request);
    await invalidateUserPasswordResetSessions(passwordResetSession.userId);
    await invalidateUserSessions(passwordResetSession.userId);
    await updateUserPassword(passwordResetSession.userId, password);
    const passwordResetSessionCookie =
      await getPasswordResetSessionCookie(request);
    await setPasswordResetSessionCookie(passwordResetSessionCookie, {
      maxAge: 0,
    });
    const sessionToken = generateSessionToken();
    const sessionFlags: SessionFlags = {
      twoFactorVerified: passwordResetSession.twoFactorVerified,
    };
    const session = await createSession(sessionToken, user.id, sessionFlags);
    const sessionCookie = await getSessionCookie(request);
    sessionCookie.token = sessionToken;
    const cookie = await setSessionCookie(sessionCookie, {
      expires: session?.expiresAt,
    });
    return redirect("/aps/test/dashboard", {
      headers: { "Set-Cookie": cookie },
    });
  }

  // const { session: passwordResetSession, user } =
  //   await getPasswordResetSession(request);
  // if (passwordResetSession === null) {
  //   return {
  //     message: "Not authenticated",
  //   };
  // }
  // if (!passwordResetSession.emailVerified) {
  //   return {
  //     message: "Forbidden",
  //   };
  // }
  // if (user.registered2FA && !passwordResetSession.twoFactorVerified) {
  //   return {
  //     message: "Forbidden",
  //   };
  // }

  // const formData = await request.formData();
  // const password = formData.get("password");
  // if (password === "") {
  //   return {
  //     message: i18n.t("login.action.mesgOne"),
  //   };
  // }
  // if (typeof password !== "string") {
  //   return {
  //     message: i18n.t("login.action.mesgTwo"),
  //   };
  // }
  // const strongPassword = await verifyPasswordStrength(password);
  // if (!strongPassword) {
  //   return {
  //     message: i18n.t("signup.action.mesgSix"),
  //   };
  // }
  // await invalidateUserPasswordResetSessions(passwordResetSession.userId);
  // await invalidateUserSessions(passwordResetSession.userId);
  // await updateUserPassword(passwordResetSession.userId, password);
  // const passwordResetSessionCookie =
  //   await getPasswordResetSessionCookie(request);
  // await setPasswordResetSessionCookie(passwordResetSessionCookie, {
  //   maxAge: 0,
  // });
  // const sessionToken = generateSessionToken();
  // const sessionFlags: SessionFlags = {
  //   twoFactorVerified: passwordResetSession.twoFactorVerified,
  // };
  // const session = await createSession(sessionToken, user.id, sessionFlags);
  // const sessionCookie = await getSessionCookie(request);
  // sessionCookie.token = sessionToken;
  // const cookie = await setSessionCookie(sessionCookie, {
  //   expires: session?.expiresAt,
  // });
  // return redirect("/aps/test/dashboard", { headers: { "Set-Cookie": cookie } });
}

export default function ResetPassword({ actionData }) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("login.cardTitle")}</CardTitle>
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
