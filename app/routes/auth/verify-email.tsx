import { useTranslation } from "react-i18next";
import { data, Form, Link, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  createEmailVerificationRequest,
  deleteUserEmailVerificationRequest,
  getEmailVerificationRequest,
  sendVerificationEmail,
  getEmailVerificationCookie,
  setEmailVerificationCookie,
} from "~/lib/email-verification.server";
import { VerifyMailSchema, validateForm } from "~/lib/form-validation.server";
import { invalidateUserPasswordResetSessions } from "~/lib/password-reset.server";
import { getSession } from "~/lib/session.server";
import { updateUserEmailAndSetEmailAsVerified } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/verify-email";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { user } = await getSession(request);
  console.log("From verify-email loader:", user);
  if (user === null) {
    return redirect("/login");
  }
  const verificationRequest = await getEmailVerificationRequest(request);
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/select-aps");
  }

  // TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
  // but we can't set cookies inside server components.
  // create email verification request
  // if (verificationRequest === null && !user.emailVerified) {
  //   const emailVerificationRequest = await createEmailVerificationRequest(
  //     user.id,
  //     user.email
  //   );
  //   sendVerificationEmail(
  //     emailVerificationRequest.email,
  //     emailVerificationRequest.code
  //   );
  //   const emailVerificationCookie = await getEmailVerificationCookie(request);
  //   emailVerificationCookie.id = emailVerificationRequest.id;
  //   return data(
  //     { user },
  //     {
  //       headers: {
  //         "Set-Cookie": await setEmailVerificationCookie(
  //           emailVerificationCookie,
  //           {
  //             expires: emailVerificationRequest.expiresAt,
  //           }
  //         ),
  //       },
  //     }
  //   );
  // }

  return { user };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { user } = await getSession(request);
  const verificationRequest = await getEmailVerificationRequest(request);
  if (verificationRequest === null) {
    return {
      message: "Not authenticated",
    };
  }
  let i18n = getInstance(context);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "resend") {
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
    return data(
      {
        intent,
        message: i18n.t("verifyEmail.resent"),
        user,
      },
      {
        headers: {
          "Set-Cookie": await setEmailVerificationCookie(
            emailVerificationCookie,
            {
              expires: emailVerificationRequest.expiresAt,
            }
          ),
        },
      }
    );
    // return data({
    //   intent,
    //   message: "A new verification code was sent to your inbox.",
    // });
  }
  //
  const result = validateForm(formData, VerifyMailSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { intent, message: i18n.t(error) };
  } else {
    const code = formData.get("code");
    // ...
    if (verificationRequest.code !== code) {
      return {
        intent,
        message: i18n.t("auth.codeInvalid"),
      };
    }
    await deleteUserEmailVerificationRequest(user?.id);
    await invalidateUserPasswordResetSessions(user?.id);
    await updateUserEmailAndSetEmailAsVerified(user?.id, user?.email);
    const emailVerificationCookie = await getEmailVerificationCookie(request);
    const cookie = await setEmailVerificationCookie(emailVerificationCookie, {
      maxAge: 0,
    });
    if (!user?.registered2FA) {
      return redirect("/2fa/setup", { headers: { "Set-Cookie": cookie } });
    }
    return redirect("/2fa/authentication", {
      headers: { "Set-Cookie": cookie },
    });
  }
}

export default function VerifyEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <CardWrapper
      title={t("verifyEmail.cardTitle")}
      description={
        t("verifyEmail.cardDescription") + " " + loaderData?.user.email
      } //, { email })}
    >
      <Form method="post">
        <FieldGroup>
          <Field>
            <input type="hidden" name="intent" value="submit" />
          </Field>
          <Field>
            <FieldLabel htmlFor="code">{t("verifyEmail.codeLabel")}</FieldLabel>
            <Input type="text" name="code" id="code" />
          </Field>
          <Field>
            <SubmitFormButton
              action="/verify-email"
              title={t("submitButton")}
            />
            {actionData && actionData?.intent === "submit" ? (
              <FieldError>{actionData.message}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>
      </Form>
      <div className="mt-6 after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-3">
          Or
        </span>
      </div>
      <Form method="post">
        <FieldGroup>
          <Field>
            <input type="hidden" name="intent" value="resend" />
          </Field>
          <Field>
            <SubmitFormButton
              action="/verify-email"
              title={t("verifyEmail.resendButton")}
            />
            {actionData && actionData?.intent === "resend" ? (
              <FieldError>{actionData.message}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>
      </Form>
      <div className="mt-6 text-sm">
        <Link className="underline underline-offset-4" to="/settings">
          {t("verifyEmail.changeMailLink")}
        </Link>
      </div>
    </CardWrapper>
  );
}
