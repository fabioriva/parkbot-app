import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
import { LoginSchema, validateForm } from "~/lib/form-validation.server";
import { verifyPasswordHash } from "~/lib/password.server";
import {
  createSession,
  generateSessionToken,
  getSession,
  getSessionCookie,
  setSessionCookie,
} from "~/lib/session.server";
import { getUserFromEmail, getUserPasswordHash } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { SessionFlags } from "~/lib/session.server";
import type { Route } from "./+types/login";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getSession(request);
  if (session !== null) {
    if (!user.emailVerified) {
      return redirect("/verify-email");
    }
    if (!user.registered2FA) {
      return redirect("/2fa/setup");
    }
    if (!session.twoFactorVerified) {
      return redirect("/2fa/authentication");
    }
    return redirect("/");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, LoginSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const email = formData.get("email");
    const password = formData.get("password");
    const user = await getUserFromEmail(email);
    if (user === null) {
      return {
        message: i18n.t("auth.accountNotFound"),
      };
    }
    const passwordHash = await getUserPasswordHash(user.id);
    const validPassword = await verifyPasswordHash(passwordHash, password);
    if (!validPassword) {
      return {
        message: i18n.t("auth.passwordInvalid"),
      };
    }
    const sessionToken = generateSessionToken();
    const sessionFlags: SessionFlags = {
      twoFactorVerified: false,
    };
    const session = await createSession(sessionToken, user.id, sessionFlags);
    const sessionCookie = await getSessionCookie(request);
    sessionCookie.token = sessionToken;
    const cookie = await setSessionCookie(sessionCookie, {
      expires: session?.expiresAt,
    });
    if (!user.emailVerified) {
      return redirect("/verify-email", { headers: { "Set-Cookie": cookie } });
    }
    if (!user.registered2FA) {
      return redirect("/2fa/setup", { headers: { "Set-Cookie": cookie } });
    }
    return redirect("/2fa/authentication", {
      headers: { "Set-Cookie": cookie },
    });
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("login.cardTitle")}</CardTitle>
        <CardDescription>{t("login.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                // type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="mail@example.com"
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("login.forgotLink")}
                </a>
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                // required
              />
            </Field>
            <Field>
              <SubmitFormButton action="/login" title={t("submitButton")} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
          {/* <div className="flex flex-col gap-6">
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
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("login.forgotLink")}
                </a>
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                // required
              />
            </div>
            <SubmitFormButton action="/login" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div> */}
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          {t("login.signup")}{" "}
          <a href="/signup" className="underline underline-offset-4">
            {t("login.signupLink")}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
