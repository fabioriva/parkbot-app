import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { ModeToggle } from "~/components/mode-toggle";
// import { OccupancyChart } from "~/components/occupancy-chart";

import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params);
}

export default function Dashboard({ params }: Route.ComponentProps) {
  let { t } = useTranslation();
  useChangeLanguage("en");

  return (
    <>
      <p>{t("login.forgotLink")}</p>
      {/* <OccupancyChart /> */}
    </>
  );
}
