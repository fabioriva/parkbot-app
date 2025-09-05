import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { CardWrapper } from "~/components/card-wrapper";
import { ModeToggle } from "~/components/mode-toggle";
import { OccupancyChart } from "~/components/occupancy-chart";
import { OperationsBarChart } from "~/components/operations-bar-chart";

import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  const res = await fetch(url);
  const data = await res.json();
  return { data };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  let { t } = useTranslation();
  useChangeLanguage("en");
  //
  console.log(loaderData);
  const { occupancy } = loaderData?.data;
  const [busy, free, lock] = occupancy;

  return (
    <>
      <p>{t("login.forgotLink")}</p>
      <CardWrapper>
        <OccupancyChart occupancy={occupancy} />
      </CardWrapper>
      <CardWrapper>
        <OperationsBarChart />
      </CardWrapper>
    </>
  );
}
