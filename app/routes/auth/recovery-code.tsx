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

export default function TwoFactorAuthentication({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("recoveryCode.cardTitle")}</CardTitle>
        <CardDescription>
          {t("recoveryCode.cardDescription")}:{" "}
          <span className="underline underline-offset-4">
            {loaderData?.recoveryCode}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{t("recoveryCode.cardContent")}.</p>
      </CardContent>
      <CardFooter>
        {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null}
        <div className="text-sm">
          <a className="underline underline-offset-4" href="/">
            {t("recoveryCode.nextLink")}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
