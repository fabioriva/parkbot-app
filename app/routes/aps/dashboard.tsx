import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { CardWrapper } from "~/components/card-wrapper";
import { Device } from "~/components/device";
import { Error } from "~/components/error";
import { ExitQueue } from "~/components/exit-queue";
import { HistoryList } from "~/components/history-list";
import { OccupancyChart } from "~/components/occupancy-chart";
import { OperationsBarChart } from "~/components/operations-bar-chart";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  const data = await fetcher(url);
  return { data };
}

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  // console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;
  const [data, setData] = useState(loaderData?.data);
  const fetcher = useFetcher();
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/aps/${params.aps}/dashboard`);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetcher]);
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data["data"]);
    }
  }, [fetcher.data]);

  const { activity, exitQueue, occupancy, operations, system } = data;
  const [busy, free, lock] = occupancy;
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      <div className="col-span-2">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {system.map((item, key) => (
            <Device device={item} enhanced={false} key={key} />
          ))}
          <ExitQueue exit={exitQueue.exitButton} queue={exitQueue.queueList} />
        </div>
      </div>
      <div className="col-span-2">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          <CardWrapper
            title={t("aps.dashboard.occupancy-title")}
            description={t("aps.dashboard.occupancy-description")}
            link={`/aps/${params.aps}/map`}
          >
            <OccupancyChart occupancy={occupancy} />
          </CardWrapper>
          <CardWrapper
            title={t("aps.dashboard.activity-title")}
            description={t("aps.dashboard.activity-description")}
            link={`/aps/${params.aps}/history`}
          >
            <HistoryList history={activity.documents} />
          </CardWrapper>
          <CardWrapper
            title={t("aps.dashboard.operations-title")}
            description={t("aps.dashboard.operations-description")}
            // link={`/aps/${params.aps}/statistics`}
            className="lg:col-span-2"
          >
            <OperationsBarChart operations={operations[0].data} />
          </CardWrapper>
        </div>
      </div>
    </div>
  );
}
