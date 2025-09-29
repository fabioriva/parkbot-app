import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { CardWrapper } from "~/components/card-wrapper";
import { HistoryList } from "~/components/history-list";
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
  const { activity, occupancy, operations } = loaderData?.data;
  const [busy, free, lock] = occupancy;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-center">
        <CardWrapper
          title="Recent activity"
          description={`Last ${activity.count} operations`}
        >
          <HistoryList history={activity.documents} />
        </CardWrapper>
        <CardWrapper
          title="Pie Chart - Occupancy"
          description="Parking occupancy"
        >
          <OccupancyChart occupancy={occupancy} />
        </CardWrapper>
        <CardWrapper
          title="Bar Chart - Operations"
          description="Parking operations"
        >
          <OperationsBarChart operations={operations[0].data} />
        </CardWrapper>
      </div>
    </>
  );
}
