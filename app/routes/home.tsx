import { useTranslation } from "react-i18next";
import { data, Form, Link } from "react-router";
import { AuroraText } from "~/components/magicui/aurora-text";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Parkbot" },
    { name: "description", content: data?.description },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  let i18n = getInstance(context);
  return data({ title: i18n.t("title"), description: i18n.t("description") });
}

export default function Home() {
  let { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen px-3">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-7xl font-extrabold md:tracking-tight">
          <AuroraText>Parkbot</AuroraText>
          <span className="hidden md:inline"> Web Service</span>
        </h1>
        <h2 className="text-xl md:text-3xl">{t("description")}</h2>
        <div className="mt-6 space-y-3">
          <Button className="w-48" size="lg" variant="outline" asChild>
            <Link to="/login">Login to Parkbot</Link>
          </Button>
          <Form className="space-x-6">
            <Button type="submit" name="lng" value="en" variant="icon">
              EN
            </Button>
            <Button type="submit" name="lng" value="it" variant="icon">
              IT
            </Button>
            <ModeToggle />
          </Form>
        </div>
      </div>
    </div>
  );
}
