import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/2fa-verify";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const totp = formData.get("totp");
    const response = await auth.api.verifyTOTP({
      asResponse: true,
      body: {
        code: totp, // required
        // trustDevice: true,
      },
      headers: await request.headers,
    });
    console.log(response);
    if (response.ok) {
      const headers = new Headers(response.headers);
      console.log(headers);
      return redirect("/aps-select", { headers });
    } else {
      return { message: response.statusText };
    }
  } catch (error) {
    console.log("verifyTotp error:\n", error);
    return { message: error?.body?.message };
  }
}

export default function Verify2FA({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twoFA.verify.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.verify.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="totp">
                {t("twoFA.verify.codeLabel")}
              </FieldLabel>
              <Input type="totp" name="totp" required />
            </Field>
            <Field>
              <Submit action="/2fa-verify" title={t("twoFA.verify.submit")} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          <a className="underline underline-offset-4" href="/2fa-reset">
            {t("twoFA.verify.recoveryLink")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
