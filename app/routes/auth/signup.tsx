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
  // getSession,
  getSessionCookie,
  setSessionCookie,
} from "~/lib/session.server";
import { createUser } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { SessionFlags } from "~/lib/session.server";
import type { Route } from "./+types/signup";

// export async function loader({ context, request }: Route.LoaderArgs) {
//   const { session, user } = await getSession(request);
//   // ...
// }

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
    <CardWrapper
      title={t("signup.cardTitle")}
      description={t("signup.cardDescription")}
    >
      <Form method="post">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              // type="text"
              name="username"
              id="username"
              autoComplete="username"
            />
          </Field>
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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">
              {t("signup.confirmLabel")}
            </FieldLabel>
            <Input
              type="password"
              name="confirm"
              id="confirm"
              autoComplete="current-password"
            />
          </Field>
          <Field>
            <SubmitFormButton action="/signup" title={t("submitButton")} />
            {actionData ? <FieldError>{actionData.message}</FieldError> : null}
          </Field>
        </FieldGroup>
      </Form>
    </CardWrapper>
  );
}
