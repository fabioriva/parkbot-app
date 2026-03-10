import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { Button } from "~/components/ui/button";
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
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/2fa-reset";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const code = formData.get("code");
    const response = await auth.api.verifyBackupCode({
      asResponse: true,
      body: {
        code, // required
        disableSession: false,
        // trustDevice: true,
      },
      headers: await request.headers,
    });
    console.log(response);
    if (response.ok) {
      const headers = new Headers(response.headers);
      console.log(headers);
      return redirect("/2fa-setup", { headers });
    } else {
      return { message: response.statusText };
    }
  } catch (error) {
    console.log("verifyBackupCode error:\n", error);
    return { message: error?.body?.message };
  }
}

export default function Reset2FA({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twoFA.reset.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.reset.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="totp">Codice di recupero</FieldLabel>
              <Input type="text" name="code" required />
            </Field>
            <Field>
              <Button type="submit">{t("twoFA.reset.submit")}</Button>
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  );
}
