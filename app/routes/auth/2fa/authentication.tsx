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
        {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null}
        <div className="text-sm">
          <a className="underline underline-offset-4" href="/2fa/reset">
            {t("twoFA.auth.recoveryLink")}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
