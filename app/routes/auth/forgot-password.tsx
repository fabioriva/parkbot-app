import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
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
    return redirect("/reset-password/verify-email", {
      headers: { "Set-Cookie": cookie },
    });
  }
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <CardWrapper
      title={t("forgotPassword.cardTitle")}
      description={t("forgotPassword.cardDescription")}
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
            <SubmitFormButton
              action="/forgot-password"
              title={t("forgotPassword.sendButton")}
            />
            {actionData ? <FieldError>{actionData.message}</FieldError> : null}
          </Field>
        </FieldGroup>
      </Form>
      <div className="mt-6 text-sm">
        {t("forgotPassword.loginLink")}{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </CardWrapper>
  );
}
