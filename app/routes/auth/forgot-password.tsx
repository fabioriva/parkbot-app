import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";

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

export default function Login({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">
          {t("forgotPassword.cardTitle")}
        </CardTitle>
        <CardDescription>{t("forgotPassword.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="mail@example.com"
                // required
              />
            </div>
            <Button action="/forgot-password" title="Submit" />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          {t("forgotPassword.login")}{" "}
          <a href="/login" className="underline underline-offset-4">
            Login
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
