import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import SubmitFormButton from "~/components/submit-form-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RecoveryCodeSchema, validateForm } from "~/lib/form-validation.server";
import { getSession } from "~/lib/session.server";
import { resetUser2FAWithRecoveryCode } from "~/lib/user.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/reset";

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
  const result = validateForm(formData, RecoveryCodeSchema);
  if (!result.success) {
    const error = result.error.issues.shift().message;
    return { message: i18n.t(error) };
  } else {
    const { user } = await getSession(request);
    const code = formData.get("code");
    const valid = await resetUser2FAWithRecoveryCode(user?.id, code);
    if (!valid) {
      return {
        message: i18n.t("auth.codeInvalid"),
      };
    }
    return redirect("/2fa/setup");
  }
}

export default function TwoFAReset({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twoFA.reset.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.reset.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">{t("twoFA.reset.codeLabel")}</Label>
              <Input
                type="text"
                name="code"
                id="code"
                // required
              />
            </div>
            <SubmitFormButton action="/2fa/reset" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
