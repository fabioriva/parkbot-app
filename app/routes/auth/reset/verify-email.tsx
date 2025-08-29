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
import {
  getPasswordResetSession,
  setPasswordResetSessionAsEmailVerified,
} from "~/lib/password-reset.server";

import type { Route } from "./+types/verify-email";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = await getPasswordResetSession(request);
  console.log("!!!!!!!!!!!", session);
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (session.emailVerified) {
    if (!session.twoFactorVerified) {
      return redirect("/reset/2fa");
    }
    return redirect("/reset/password");
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session } = await getPasswordResetSession(request);
  if (session === null) {
    return {
      message: "Not authenticated",
    };
  }
  if (session.emailVerified) {
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
      message: "Enter your code",
    };
  }
  // ...
  if (session.code !== code) {
    return {
      message: "Incorrect code.",
    };
  }
  await setPasswordResetSessionAsEmailVerified(session.id);
  // const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(
  //   session.userId,
  //   session.email
  // );
  // if (!emailMatches) {
  //   return {
  //     message: "Please restart the process",
  //   };
  // }
  return redirect("/reset/2fa");
}

export default function ResetPasswordVerifyEmail({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("verifyEmail.cardTitle")}</CardTitle>
        <CardDescription>
          {t("verifyEmail.cardDescription")}{" "}
          <span className="underline underline-offset-4">
            {loaderData?.emailVerificationRequest?.email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">{t("verifyEmail.codeLabel")}</Label>
              <Input type="text" name="code" id="code" required />
            </div>
            {/* <input type="hidden" name="intent" value="submit" /> */}
            <SubmitFormButton
              action="/reset/verify-email"
              title={t("submitButton")}
            />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
        {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-3">
            Or
          </span>
        </div>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <input type="hidden" name="intent" value="resend" />
            <SubmitFormButton
              action="/resend-code"
              title={t("verifyEmail.resendButton")}
            />
          </div>
        </Form> */}
      </CardContent>
      {/* <CardFooter>
        <div className="text-sm">
          <Link className="underline underline-offset-4" to="/settings">
            {t("verifyEmail.changeMailLink")}
          </Link>
        </div>
      </CardFooter> */}
    </Card>
  );
}
