import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
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
  if (user === null) {
    return redirect("/login");
  }
  console.log("verify-email loader:", user);
  // TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
  // but we can't set cookies inside server components.
  const verificationRequest = await getEmailVerificationRequest(request);
  console.log("verificationRequest:", verificationRequest);
  // create email verification request
  if (verificationRequest === null && !user.emailVerified) {
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
    return redirect("/verify-email", {
      headers: {
        "Set-Cookie": await setEmailVerificationCookie(
          emailVerificationCookie,
          {
            expires: emailVerificationRequest.expiresAt,
          }
        ),
      },
    });
  }
  // redirect
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/select-aps");
  }
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
  // if (intent === "resend-code") {
  //   const emailVerificationRequest = await createEmailVerificationRequest(
  //     user.id,
  //     user.email
  //   );
  //   sendVerificationEmail(
  //     emailVerificationRequest.email,
  //     emailVerificationRequest.code
  //   );
  //   return { message: "A new verification code was sent to your inbox." };
  // }
  const result = validateForm(formData, VerifyMailSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const code = formData.get("code");
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
    return redirect("/", { headers: { "Set-Cookie": cookie } });
  }
}

export default function VerifyEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const { email } =
    loaderData?.emailVerificationRequest?.email ?? "mail@example.com";
  return (
    <CardWrapper
      title={t("verifyEmail.cardTitle")}
      description={t("verifyEmail.cardDescription")} //, { email })}
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
            {actionData ? <FieldError>{actionData.message}</FieldError> : null}
          </Field>
        </FieldGroup>
      </Form>
    </CardWrapper>
  );
  // return (
  //   <Card>
  //     <CardHeader className="text-center">
  //       <CardTitle className="text-lg">{t("verifyEmail.cardTitle")}</CardTitle>
  //       <CardDescription>
  //         {t("verifyEmail.cardDescription")}{" "}
  //         <span className="underline underline-offset-4">
  //           {loaderData?.emailVerificationRequest?.email}
  //         </span>
  //       </CardDescription>
  //     </CardHeader>
  //     <CardContent className="space-y-3">
  //       <Form method="post">
  //         <div className="flex flex-col gap-6">
  //           <div className="grid gap-3">
  //             <Label htmlFor="code">{t("verifyEmail.codeLabel")}</Label>
  //             <Input
  //               type="text"
  //               name="code"
  //               id="code"
  //               // required
  //             />
  //           </div>
  //           <input type="hidden" name="intent" value="submit" />
  //           <SubmitFormButton
  //             action="/verify-email"
  //             title={t("submitButton")}
  //           />
  //           {actionData ? (
  //             <p className="text-sm text-red-500">{actionData.message}</p>
  //           ) : null}
  //         </div>
  //       </Form>
  //       {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
  //         <span className="bg-card text-muted-foreground relative z-10 px-3">
  //           Or
  //         </span>
  //       </div>
  //       <Form method="post">
  //         <div className="flex flex-col gap-6">
  //           <input type="hidden" name="intent" value="resend-code" />
  //           <SubmitFormButton
  //             action="/verify-email"
  //             title={t("verifyEmail.resendButton")}
  //           />
  //         </div>
  //       </Form> */}
  //     </CardContent>
  //     <CardFooter>
  //       <div className="text-sm">
  //         <Link className="underline underline-offset-4" to="/settings">
  //           {t("verifyEmail.changeMailLink")}
  //         </Link>
  //       </div>
  //     </CardFooter>
  //   </Card>
  // );
}
