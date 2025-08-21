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
