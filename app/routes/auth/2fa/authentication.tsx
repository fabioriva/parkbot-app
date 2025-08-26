import { verifyTOTP } from "@oslojs/otp";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
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
import { getUserTOTPKey } from "~/lib/user.server";

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
    return redirect("/");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session, user } = await getSession(request);
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }
  if (!user.emailVerified || !user.registered2FA || session.twoFactorVerified) {
    return {
      message: "Forbidden",
    };
  }
  const formData = await request.formData();
  const code = formData.get("code");
  if (typeof code !== "string") {
    return {
      message: "Invalid or missing fields",
    };
  }
  if (code === "") {
    return {
      message: "Please enter your code",
    };
  }
  const totpKey = await getUserTOTPKey(user.id);
  console.log(totpKey);
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
  await setSessionAs2FAVerified(session.id);
  return redirect("/");
}

export default function TwoFactorAuthentication({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("twoFA.auth.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.auth.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">{t("twoFA.auth.codeLabel")}</Label>
              <Input type="text" name="code" id="code" required />
            </div>
            <SubmitFormButton
              action="/2fa/authentication"
              title={t("submitButton")}
            />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
      <CardFooter>
        {/* {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null} */}
        <div className="text-sm">
          <a className="underline underline-offset-4" href="/2fa/reset">
            {t("twoFA.auth.recoveryLink")}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
