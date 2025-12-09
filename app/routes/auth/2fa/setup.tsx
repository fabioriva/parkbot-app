import { encodeBase64, decodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI, verifyTOTP } from "@oslojs/otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import { renderSVG } from "uqr";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { TotpCodeSchema, validateForm } from "~/lib/form-validation.server";
import { getSession, setSessionAs2FAVerified } from "~/lib/session.server";
import { updateUserTOTPKey } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/setup";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session, user } = await getSession(request);
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/2fa/authentication");
  }
  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI("Parkbot", user.username, totpKey, 30, 6);
  return { encodedTOTPKey, keyURI };
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
    const encodedKey = formData.get("key");
    const code = formData.get("code");
    let key: Uint8Array;
    try {
      key = decodeBase64(encodedKey);
    } catch {
      return { message: i18n.t("auth.keyInvalid") };
    }
    if (key.byteLength !== 20) {
      return { message: i18n.t("auth.keyInvalid") };
    }
    if (!verifyTOTP(key, 30, 6, code)) {
      return { message: i18n.t("auth.codeInvalid") };
    }
    await updateUserTOTPKey(session?.userId, key);
    await setSessionAs2FAVerified(session?.id);
    return redirect("/recovery-code");
  }
}

export default function TwoFASetup({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const qrcode = renderSVG(loaderData.keyURI);
  return (
    <CardWrapper
      title={t("twoFA.setup.cardTitle")}
      description={t("twoFA.setup.cardDescription")}
    >
      <div className="mb-6">
        <div
          className="h-[200px] w-[200px]"
          dangerouslySetInnerHTML={{
            __html: qrcode,
          }}
        />
      </div>
      <Form method="post" ref={formRef}>
        <FieldGroup>
          <Field>
            <input
              id="key"
              name="key"
              value={loaderData?.encodedTOTPKey}
              hidden
              readOnly
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="otp">{t("twoFA.setup.codeLabel")}</FieldLabel>
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
    </CardWrapper>
  );
}
