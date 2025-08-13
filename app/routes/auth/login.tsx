import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import * as z from "zod";
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
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/login";

export async function action({ context, request }: Route.ActionArgs) {
  let i18n = getInstance(context);
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (email === "" || password === "") {
    return {
      message: i18n.t("login.action.mesgOne"),
    };
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return {
      message: i18n.t("login.action.mesgTwo"),
    };
  }
  if (!z.string().email().safeParse(email).success) {
    return {
      message: i18n.t("login.action.mesgThree"),
    };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("login.cardTitle")}</CardTitle>
        <CardDescription>{t("login.cardDescription")}</CardDescription>
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
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t("login.forgot")}
                </a>
              </div>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                // required
              />
            </div>
            <Button action="/login" title="Submit" />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          {t("login.signup")}{" "}
          <a href="signup" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
