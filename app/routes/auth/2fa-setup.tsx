import { CopyIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { Form, Link, redirect } from "react-router";
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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/2fa-setup";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const password = formData.get("password");
    const data = await auth.api.enableTwoFactor({
      body: {
        password,
      },
      headers: await request.headers,
    });
    return { ...data };
  } catch (error) {
    console.log("error:\n", error);
    return { message: error?.body?.message };
  }
}

export default function Setup2FA({ actionData }) {
  let { t } = useTranslation();
  if (actionData?.totpURI) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("twoFA.setupTwo.cardTitle")}</CardTitle>
          <CardDescription>
            {t("twoFA.setupTwo.cardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldContent>
                <QRCode value={actionData.totpURI || ""} />
              </FieldContent>
              <Field>
                <p className="text-muted-foreground text-sm">
                  {t("twoFA.setupTwo.cardContent")}
                </p>
                <div className="relative py-4 rounded-lg">
                  <pre className="grid grid-cols-2 gap-1">
                    {actionData.backupCodes.map((code, i) => (
                      <code key={i}>{code}</code>
                    ))}
                  </pre>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 size-8 cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        actionData.backupCodes.map((code) => code).join("\n"),
                      )
                    }
                  >
                    <CopyIcon size="20" />
                  </Button>
                </div>
              </Field>
              <Field>
                <Button asChild>
                  <Link to="/2fa-verify">{t("twoFA.setupTwo.submit")}</Link>
                </Button>
              </Field>
            </FieldSet>
          </FieldGroup>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("twoFA.setupOne.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.setupOne.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <input type="hidden" name="intent" value="password" />
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <Button type="submit">{t("twoFA.setupOne.submit")}</Button>
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
