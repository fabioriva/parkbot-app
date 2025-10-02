import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { CardWrapper } from "~/components/card-wrapper";
import { Device } from "~/components/device";
import { HistoryList } from "~/components/history-list";
import { ModeToggle } from "~/components/mode-toggle";
import { OccupancyChart } from "~/components/occupancy-chart";
import { OperationsBarChart } from "~/components/operations-bar-chart";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  const data = await fetcher(url);
  return { data };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  let { t } = useTranslation();
  useChangeLanguage("en");

  const { activity, occupancy, operations, system } = loaderData?.data;
  const [busy, free, lock] = occupancy;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {system.map((item, key) => (
          <Device device={item} enhanced={false} key={key} />
        ))}
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
