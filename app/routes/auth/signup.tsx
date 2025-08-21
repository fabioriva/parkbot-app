import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import * as cookie from "cookie";
import * as z from "zod";
import Button from "~/components/submitFormButton";
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
  sendVerificationEmail,
} from "~/lib/email-verification.server";
import { verifyPasswordStrength } from "~/lib/password.server";
import {
  createSession,
  generateSessionToken,
  getSession,
} from "~/lib/session.server";
import { createUser } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { SessionFlags } from "~/lib/server/session";
import type { Route } from "./+types/signup";

export async function loader({ context, request }: Route.LoaderArgs) {
  // const { session, user } = await getSession(request);
  await getSession(request);
}

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const email = formData.get("email");
  const confirm = formData.get("confirm");
  const password = formData.get("password");
  const username = formData.get("username");
  if (email === "" || password === "" || username === "") {
    return {
      message: i18n.t("signup.action.mesgOne"),
    };
  }
  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return {
      message: i18n.t("signup.action.mesgTwo"),
    };
  }
  if (!z.string().min(4).max(31).safeParse(username).success) {
    return {
      message: i18n.t("signup.action.mesgFive"),
    };
  }
  if (!z.string().email().safeParse(email).success) {
    return {
      message: i18n.t("signup.action.mesgThree"),
    };
  }
  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) {
    return {
      message: i18n.t("signup.action.mesgFour"),
    };
  }
  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) {
    return {
      message: i18n.t("signup.action.mesgSix"),
    };
  }
  if (confirm !== password) {
    return {
      message: i18n.t("signup.action.mesgSeven"),
    };
  }
  const user = await createUser(email, username, password);
  const emailVerificationRequest = await createEmailVerificationRequest(
    user.id,
    user.email
  );
  const expires = emailVerificationRequest.expiresAt.toUTCString();
  sendVerificationEmail(
    emailVerificationRequest.email,
    emailVerificationRequest.code
  );
  const sessionToken = generateSessionToken();
  const sessionFlags: SessionFlags = {
    twoFactorVerified: false,
  };
  const session = await createSession(sessionToken, user.id, sessionFlags);
  // redirect and set email verification / session cookies
  // const emailVerificationCookie = `__email_verification=${emailVerificationRequest.id}; Expires=${emailVerificationRequest.expiresAt.toUTCString()}; HttpOnly; Path=/; Secure; SameSite=Lax`;
  const emailVerificationCookie = cookie.serialize(
    "__email_verification",
    emailVerificationRequest.id,
    {
      expires: emailVerificationRequest.expiresAt,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    }
  );
  // const sessionCookie = `__session=${sessionToken}; Expires=${session.expiresAt.toUTCString()}; HttpOnly; Path=/; Secure; SameSite=Lax`;
  const sessionCookie = cookie.serialize("__session", sessionToken, {
    expires: session.expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return redirect("/login", {
    headers: [
      ["Set-Cookie", emailVerificationCookie],
      ["Set-Cookie", sessionCookie],
    ],
  });
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
              <Label htmlFor="confirm">
                {t("signup.cardContent.confirmPassword")}
              </Label>
              <Input
                type="password"
                name="confirm"
                id="confirm"
                autoComplete="current-password"
                // placeholder="Confirm password"
                // required
              />
            </div>
            <Button action="/signup" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
