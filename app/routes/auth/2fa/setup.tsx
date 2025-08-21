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
  const qrcode = renderSVG(keyURI);
  return qrcode;
}

export default function TwoFASetup({ loaderData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("twoFA.setup.cardTitle")}</CardTitle>
        <CardDescription>{t("twoFA.setup.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
