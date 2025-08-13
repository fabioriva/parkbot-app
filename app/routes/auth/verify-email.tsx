import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
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

export async function loader({ context, request }: Route.LoaderArgs) {}

export async function action({ context, request }: Route.ActionArgs) {}

export default function VerifyEmail({
  actionData,
  // loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("verifyEmail.cardTitle")}</CardTitle>
        <CardDescription>
          {t("verifyEmail.cardDescription")}{" "}
          {/* {loaderData?.verificationRequest?.email} */}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="code">Verification code</Label>
              <Input type="text" name="code" id="code" required />
            </div>
            <Button action="/verify-email" title="Submit" />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
      {/* <CardFooter>
        {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null}
        <div className="text-center text-sm">
          <Link href="/settings">Change your email</Link>
        </div>
      </CardFooter> */}
    </Card>
  );
}
