import { encodeBase64, decodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI, verifyTOTP } from "@oslojs/otp";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import { renderSVG } from "uqr";
import SubmitFormButton from "~/components/submitFormButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getSession, setSessionAs2FAVerified } from "~/lib/session.server";
import { updateUserTOTPKey } from "~/lib/user.server";

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
  const keyURI = createTOTPKeyURI("Parkbot App", user.username, totpKey, 30, 6);
  return { encodedTOTPKey, keyURI };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session, user } = await getSession(request);
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }
  if (!user.emailVerified) {
    return {
      message: "Forbidden",
    };
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return {
      message: "Forbidden",
    };
  }

  const formData = await request.formData();
  const encodedKey = formData.get("key");
  const code = formData.get("code");
  console.log("code:", code, "encoded key:", encodedKey);
  if (typeof encodedKey !== "string" || typeof code !== "string") {
    return {
      message: "Invalid or missing fields",
    };
  }
  if (code === "") {
    return {
      message: "Please enter your code",
    };
  }
  if (encodedKey.length !== 28) {
    return {
      message: "Please enter your code",
    };
  }
  let key: Uint8Array;
  try {
    key = decodeBase64(encodedKey);
  } catch {
    return {
      message: "Invalid key",
    };
  }
  if (key.byteLength !== 20) {
    return {
      message: "Invalid key",
    };
  }
  if (!verifyTOTP(key, 30, 6, code)) {
    return {
      message: "Invalid code",
    };
  }
  await updateUserTOTPKey(session.userId, key);
  await setSessionAs2FAVerified(session.id);
  return redirect("/recovery-code");
}

export default function TwoFASetup({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const qrcode = renderSVG(loaderData.keyURI);
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("twoFA.setup.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.setup.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div
            className="h-[200px] w-[200px]"
            dangerouslySetInnerHTML={{
              __html: qrcode,
            }}
          />
        </div>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <input
                id="key"
                name="key"
                value={loaderData?.encodedTOTPKey}
                hidden
                readOnly
              />
              <Label htmlFor="code">{t("twoFA.setup.codeLabel")}</Label>
              <Input type="text" name="code" id="code" required />
            </div>
            <SubmitFormButton action="/2fa/setup" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
