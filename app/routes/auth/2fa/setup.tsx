import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import { renderSVG } from "uqr";
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

export async function loader({ context, request }: Route.LoaderArgs) {
  // const { session, user } = await getSession(request);
  // await getSession(request);
  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI(
    "ParkbotApp",
    "user.username",
    totpKey,
    30,
    6
  );
  return { encodedTOTPKey, keyURI };
}

export default function TwoFASetup({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  const qrcode = renderSVG(loaderData.keyURI);
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("twoFA.setup.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.setup.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div
            className="h-[200px] w-[200px]"
            dangerouslySetInnerHTML={{
              __html: qrcode,
            }}
          />
        </div>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <input
                name="key"
                value={actionData?.encodedTOTPKey}
                hidden
                required
              />
              <Label htmlFor="code">OTP code</Label>
              <Input type="text" name="code" id="code" required />
            </div>
            <Button action="/2fa/setupl" title={t("submitButton")} />
            {actionData ? (
              <p className="text-sm text-red-500">{actionData.message}</p>
            ) : null}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
