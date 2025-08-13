import { useTranslation } from "react-i18next";
import { data, Form, Link } from "react-router";
import { Button } from "~/components/ui/button";

import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Parkbot" },
    { name: "description", content: data?.description },
  ];
}

export default function Home() {
  let { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <h2 className="text-xl">{t("description")}</h2>
        <Link className="underline" to="/login">
          Login to Parkbot
        </Link>
        <Form className="space-x-6">
          <Button type="submit" name="lng" value="en">
            English
          </Button>
          <Button type="submit" name="lng" value="it">
            Italiano
          </Button>
        </Form>
      </div>
    </div>
  );
}
