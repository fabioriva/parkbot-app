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
import type { Route } from "./+types/password-change";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");
    const data = await auth.api.changePassword({
      body: {
        newPassword, // required
        currentPassword, // required
        revokeOtherSessions: true,
      },
      headers: await request.headers,
    });
    console.log("changePassword (server):\n", data);
  } catch (error) {
    console.log("changePassword error (server):\n", error);
    return { message: error?.body?.message };
  }
}

export default function PasswordChange({ actionData }: Route.ComponentProps) {
  const t = (t) => t;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("password-change.cardTitle")}</CardTitle>
        <CardDescription>
          {t("password-change.cardDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">
                Current password
              </FieldLabel>
              <Input type="password" name="currentPassword" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input type="password" name="newPassword" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm new password
              </FieldLabel>
              <Input type="password" name="confirmPassword" required />
            </Field>
            <Field>
              <Button className="w-full">Change password</Button>
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
