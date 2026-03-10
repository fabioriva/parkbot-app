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
import { Submit } from "~/components/submit-button";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/signin";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const { headers, response } = await auth.api.signInEmail({
      // asResponse: true, // returns a response object instead of data
      returnHeaders: true,
      body: {
        email,
        password,
        rememberMe: false,
        callbackURL: "/aps-select",
      },
      headers: await request.headers,
    });
    console.log(headers);
    console.log(response);
    if ("twoFactorRedirect" in response) {
      return redirect("/2fa-verify", { headers });
    }
    return redirect(response?.url || "/dashboard", { headers });
  } catch (error) {
    console.log("signInEmail error:\n", error);
    return { message: error?.body?.message };
  }
}

export default function Signin({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("signin.cardTitle")}</CardTitle>
        <CardDescription>{t("signin.cardDescription")}</CardDescription>
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
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="/password-forgot"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("signin.forgotLink")}
                </a>
              </div>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <Submit action="/signin" title={t("signin.submit")} />
              {/* <Button type="submit">{t("signin.submit")}</Button> */}
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {t("signin.signup")}{" "}
          <a href="/signup" className="underline underline-offset-4">
            {t("signin.signupLink")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
