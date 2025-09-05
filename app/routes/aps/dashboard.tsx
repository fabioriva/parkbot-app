import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { ModeToggle } from "~/components/mode-toggle";
import { OccupancyChart } from "~/components/occupancy-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
      <Card className="flex flex-col ">
        <CardHeader className="items-center pb-0">
          <CardTitle>Pie Chart - Occupancy</CardTitle>
          <CardDescription>Parking occupancy</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <OccupancyChart occupancy={occupancy} />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="text-muted-foreground leading-none">
            Vacant {free.value}, occupied {busy.value} and locked {lock.value}.
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
