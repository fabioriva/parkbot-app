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
import type { Route } from "./+types/password-reset";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const newPassword = formData.get("newPassword");
    const token = formData.get("token");
    const data = await auth.api.resetPassword({
      body: {
        newPassword, // required
        token, // required
      },
    });
    console.log("resetPassword (server):\n", data);

    // const headers = new Headers(data.headers);
    // console.log(headers);
    // return redirect("/", { headers });
    return { message: "Password changed!!!" };
  } catch (error) {
    console.log("resetPassword error (server):\n", error);
    return { message: error?.body?.message };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  // const data = await auth.api.getSession({
  //   headers: await request.headers,
  // });
  // const { session, user } = data
  // console.log(session);
  // console.log(user);
  // if (!session) {
  //   return redirect("/");
  // }
  // if (!user.emailVerified) {
  //   return redirect("/verify-email");
  // }
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const token = searchParams.get("token");
  // return { session, token, user };
  return { token };
}

export default function PasswordReset({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  // console.log(actionData);
  // console.log(loaderData);
  let { t } = useTranslation();
  // const resetPassword = async () => {
  //   const { data, error } = await authClient.resetPassword({
  //     newPassword: "h0savP6L.",
  //     token: loaderData?.token,
  //   });
  //   console.log(data, error);
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("passwordReset.cardTitle")}</CardTitle>
        <CardDescription>{t("passwordReset.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">{t("passwordReset.passwordLabel")}</FieldLabel>
              <Input
                type="password"
                name="newPassword"
                // id="password"
                // autoComplete="current-password"
              />
            </Field>
            <input type="hidden" name="token" value={loaderData?.token} />
            <Field>
              <Submit action="/password-reset" title={t("passwordReset.submit")} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        {/* <Button onClick={resetPassword}>Reset password</Button> */}
      </CardContent>
    </Card>
  );
}
