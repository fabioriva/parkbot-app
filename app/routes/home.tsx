import { useTranslation } from "react-i18next";
import { data, Form, Link } from "react-router";
import { AuroraText } from "~/components/magicui/aurora-text";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Parkbot App" },
    { name: "Parkbot", content: "Parkbot Web Service" },
  ];
}

export default function Home() {
  let { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen px-3">
      <div className="flex flex-col gap-3 items-center text-center">
        <h1 className="text-7xl font-extrabold tracking-tight">
          <AuroraText>Parkbot</AuroraText>
          <span className="inline md:hidden"> App</span>
          <span className="hidden md:inline"> Web Service</span>
        </h1>
        <h2 className="text-xl md:text-3xl">
          {t("home.description")}
        </h2>
        <div className="mt-6 space-y-3">
          <Button className="w-48" size="lg" variant="outline" asChild>
            <Link to="/signin">Signin to Parkbot</Link>
          </Button>
          <Form className="flex justify-center items-center gap-6">
            <Button type="submit" name="lng" value="en" variant="icon">
              EN
            </Button>
            <Button type="submit" name="lng" value="it" variant="icon">
              IT
            </Button>
            <ModeToggle />
          </Form>
        </div>
        <footer className="text-xs md:text-sm">
          {"Parkbot © "}
          {new Date().getFullYear()}{" "}
          <Link
            className="hover:underline hover:text-blue-500"
            to="https://www.sotefin.com/"
          >
            Sotefin SA
          </Link>
        </footer>
      </div>
    </div>
  );
}
