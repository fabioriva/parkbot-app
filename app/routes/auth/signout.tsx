import { Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useNavigate, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldGroup } from "~/components/ui/field";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/signout";

export async function action({ request }: Route.ActionArgs) {
  const data = await auth.api.signOut({
    asResponse: true,
    headers: await request.headers,
  });
  const headers = new Headers(data.headers);
  return redirect("/", { headers });
}

export default function Signout() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("signout.cardTitle")}</CardTitle>
        <CardDescription>{t("signout.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex gap-3">
          <Button className="flex-1" variant="secondary" asChild>
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Cancel
            </Link>
          </Button>
          {navigation.formAction === "/signout" ? (
            <Button className="flex-1" disabled>
              <Loader2Icon className="animate-spin" />
              {t("signout.submit")}
            </Button>
          ) : (
            <Button className="flex-1" type="submit">
              {t("signout.submit")}
            </Button>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
