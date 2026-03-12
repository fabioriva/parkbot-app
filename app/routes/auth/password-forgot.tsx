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
import type { Route } from "./+types/password-forgot";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    if (!email) {
      return { message: "Enter a valid email" };
    }
    const data = await auth.api.requestPasswordReset({
      body: {
        email, // required
        redirectTo: "/password-reset", // required
      },
    });
    console.log("requestPasswordReset (server):\n", data);
  } catch (error) {
    console.log("resetPassword error (server):\n", error);
    return { message: error?.body?.message };
  }
}

export default function PasswordForgot({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("passwordForgot.cardTitle")}</CardTitle>
        <CardDescription>{t("passwordForgot.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="mail@example.com"
              />
            </Field>
            <Field>
              <Button className="w-full" type="submit">
                {t("passwordForgot.submit")}
              </Button>
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {t("passwordForgot.signinLink")}{" "}
          <a href="/signin" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
