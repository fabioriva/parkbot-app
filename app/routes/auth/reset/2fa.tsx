import { verifyTOTP } from "@oslojs/otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
// import { Label } from "~/components/ui/label";
import {
  RecoveryCodeSchema,
  TotpCodeSchema,
  validateForm,
} from "~/lib/form-validation.server";
import {
  getPasswordResetSession,
  setPasswordResetSessionAs2FAVerified,
} from "~/lib/password-reset.server";
import {
  getUserTOTPKey,
  resetUser2FAWithRecoveryCode,
} from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/2fa";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getPasswordResetSession(request);
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (!session.emailVerified) {
    return redirect("/reset-password/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/reset-password/password");
  }
  if (session.twoFactorVerified) {
    return redirect("/reset-password/password");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session, user } = await getPasswordResetSession(request);
  let i18n = getInstance(context);
  const formData = await request.formData();
  const code = formData.get("code");
  const intent = formData.get("intent");
  if (intent === "otp") {
    // OTP
    const result = validateForm(formData, TotpCodeSchema);
    if (!result.success) {
      const error = result.error.issues.shift().message;
      return { message: i18n.t(error) };
    } else {
      const totpKey = await getUserTOTPKey(user?.id);
      if (totpKey === null) {
        return {
          message: "Forbidden",
        };
      }
      if (!verifyTOTP(totpKey, 30, 6, code)) {
        return {
          message: "Invalid code",
        };
      }
      await setPasswordResetSessionAs2FAVerified(session.id);
      return redirect("/reset-password/password");
    }
  } else {
    // Recovery code
    const result = validateForm(formData, RecoveryCodeSchema);
    if (!result.success) {
      const error = result.error.issues.shift().message;
      return { message: i18n.t(error) };
    } else {
      const valid = await resetUser2FAWithRecoveryCode(user?.id, code);
      if (!valid) {
        return {
          message: i18n.t("auth.codeInvalid"),
        };
      }
      return redirect("/reset-password/password");
    }
  }
  // if (session === null) {
  //   return {
  //     message: "Not authenticated",
  //   };
  // }
  // if (
  //   !session.emailVerified ||
  //   !user.registered2FA ||
  //   session.twoFactorVerified
  // ) {
  //   return {
  //     message: "Forbidden",
  //   };
  // }
  // const formData = await request.formData();
  // const code = formData.get("code");
  // if (typeof code !== "string") {
  //   return {
  //     message: "Invalid or missing fields",
  //   };
  // }
  // if (code === "") {
  //   return {
  //     message: "Enter your code",
  //   };
  // }
  // const totpKey = await getUserTOTPKey(user.id);
  // console.log(totpKey);
  // if (totpKey === null) {
  //   return {
  //     message: "Forbidden",
  //   };
  // }
  // if (!verifyTOTP(totpKey, 30, 6, code)) {
  //   return {
  //     message: "Invalid code",
  //   };
  // }
  // await setPasswordResetSessionAs2FAVerified(session.id);
  // return redirect("/reset/password");
}

export default function ResetPassword2FA({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <CardWrapper
      title={t("twoFA.auth.cardTitle")}
      description={t("twoFA.auth.cardDescription")}
    >
      <Form method="post" ref={formRef}>
        <FieldGroup>
          <Field>
            <input type="hidden" name="intent" value="otp" />
          </Field>
          <Field>
            <FieldLabel htmlFor="otp">{t("twoFA.auth.codeLabel")}</FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              name="code"
              // inputMode="numeric"
              pattern={REGEXP_ONLY_DIGITS}
              onComplete={() => formRef.current?.submit()}
              // onComplete={() => buttonRef.current?.focus()}
              autoFocus
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>Enter the 6-digit OTP code.</FieldDescription>
            {actionData ? <FieldError>{actionData.message}</FieldError> : null}
          </Field>
        </FieldGroup>
      </Form>
      <div className="my-6 after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-card text-muted-foreground relative z-10 px-3">
          {t("twoFA.reset.orDivider")}
        </span>
      </div>
      <Form method="post">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="code">{t("twoFA.reset.codeLabel")}</FieldLabel>
            <Input type="text" name="code" id="code" />
          </Field>
          <Field>
            <SubmitFormButton
              action="/reset-password/2fa"
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
  //     <CardHeader>
  //       <CardTitle>{t("twoFA.auth.cardTitle")}</CardTitle>
  //       <CardDescription>{t("twoFA.auth.cardDescription")}</CardDescription>
  //     </CardHeader>
  //     <CardContent className="space-y-3">
  //       <Form method="post">
  //         <div className="flex flex-col gap-6">
  //           <div className="grid gap-3">
  //             <Label htmlFor="code">{t("twoFA.auth.codeLabel")}</Label>
  //             <Input type="text" name="code" id="code" required />
  //           </div>
  //           <input type="hidden" name="intent" value="otp" />
  //           <SubmitFormButton
  //             action="/reset-password/2fa"
  //             title={t("submitButton")}
  //           />
  //           {actionData ? (
  //             <p className="text-sm text-red-500">{actionData.message}</p>
  //           ) : null}
  //         </div>
  //       </Form>
  //       <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
  //         <span className="bg-card text-muted-foreground relative z-10 px-3">
  //           {t("twoFA.reset.orDivider")}
  //         </span>
  //       </div>
  //       <Form method="post">
  //         <div className="flex flex-col gap-6">
  //           <div className="grid gap-3">
  //             <Label htmlFor="code">{t("twoFA.reset.codeLabel")}</Label>
  //             <Input type="text" name="code" id="code" required />
  //           </div>
  //           <input type="hidden" name="intent" value="recovery" />
  //           <SubmitFormButton action="/2fa/reset" title={t("submitButton")} />
  //           {actionData ? (
  //             <p className="text-sm text-red-500">{actionData.message}</p>
  //           ) : null}
  //         </div>
  //       </Form>
  //     </CardContent>
  //   </Card>
  // );
}
