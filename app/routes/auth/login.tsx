import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
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
    return redirect("/select-aps");
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
    <CardWrapper
      title={t("login.cardTitle")}
      description={t("login.cardDescription")}
    >
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
            {actionData ? <FieldError>{actionData.message}</FieldError> : null}
          </Field>
        </FieldGroup>
      </Form>
      <div className="mt-6 text-sm">
        {t("login.signup")}{" "}
        <a href="/signup" className="underline underline-offset-4">
          {t("login.signupLink")}
        </a>
      </div>
    </CardWrapper>
  );
}
