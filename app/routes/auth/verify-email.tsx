import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import Button from "~/components/submitFormButton";
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
import { getEmailVerificationRequest } from "~/lib/email-verification.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/verify-email";

export async function loader({ context, request }: Route.LoaderArgs) {
  const emailVerificationRequest = await getEmailVerificationRequest(request);
  // console.log("!!!!!!!!!!!", emailVerificationRequest);
  // if (emailVerificationRequest === null) {
  //   return redirect("/login");
  // }
  // return { emailVerificationRequest };
}

export async function action({ context, request }: Route.ActionArgs) {
  const emailVerificationRequest = await getEmailVerificationRequest(request);
  if (emailVerificationRequest === null) {
    return {
      message: "Not authenticated",
    };
  }
  const formData = await request.formData();
  const intent = formData.get("intent");
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
  if (emailVerificationRequest.code !== code) {
    return {
      message: "Incorrect code.",
    };
  }
  // email_verification delete momgodb
  // email_verification delete cookie
  // user update email and set as verified
}

export default function VerifyEmail({
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
            <input type="hidden" name="intent" value="submit" />
            <Button action="/verify-email" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-3">
            Or
          </span>
        </div>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <input type="hidden" name="intent" value="resend" />
            <Button
              action="/resend-code"
              title={t("verifyEmail.resendButton")}
            />
          </div>
        </Form>
      </CardContent>
      <CardFooter>
        {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null}
        <div className="text-sm">
          <Link className="underline underline-offset-4" href="/settings">
            {t("verifyEmail.changeMailLink")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
