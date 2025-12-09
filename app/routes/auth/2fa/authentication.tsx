import { verifyTOTP } from "@oslojs/otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { TotpCodeSchema, validateForm } from "~/lib/form-validation.server";
import { getSession, setSessionAs2FAVerified } from "~/lib/session.server";
import { getUserTOTPKey } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/authentication";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getSession(request);
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup");
  }
  if (session.twoFactorVerified) {
    return redirect("/aps/test/dashboard");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const result = validateForm(formData, TotpCodeSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const { session, user } = await getSession(request);
    const totpKey = await getUserTOTPKey(user?.id);
    if (totpKey === null) {
      return {
        message: "Forbidden",
      };
    }
    const code = formData.get("code");
    if (!verifyTOTP(totpKey, 30, 6, code)) {
      return { message: i18n.t("auth.codeInvalid") };
    }
    await setSessionAs2FAVerified(session?.id);
    return redirect("/select-aps");
  }
}

export default function TwoFactorAuthentication({
  actionData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  // const buttonRef = useRef<HTMLFormElement>(null);
  return (
    <CardWrapper
      title={t("twoFA.auth.cardTitle")}
      description={t("twoFA.auth.cardDescription")}
    >
      <Form method="post" ref={formRef}>
        <FieldGroup>
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
      <div className="mt-6 text-sm">
        <a className="underline underline-offset-4" href="/2fa/reset">
          {t("twoFA.auth.recoveryLink")}
        </a>
      </div>
    </CardWrapper>
  );
}
