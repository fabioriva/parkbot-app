import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Device } from "~/components/device";
import { ExitQueue } from "~/components/exit-queue";
import { HistoryList } from "~/components/history-list";
import { Occupancy } from "~/components/occupancy-chart";
import { Operations } from "~/components/operations-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const Widget = () => <div className="aspect-video rounded-xl bg-muted" />;

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const [data, setData] = useState(loaderData);
  const fetcher = useFetcher();
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/aps/${params.aps}/dashboard`);
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetcher]);
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);
  // console.log(data);
  const { activity, exitQueue, occupancy, operations, system } = data;
  const [busy, free, lock] = occupancy;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        {system.map((item, key) => (
          <Device device={item} key={key} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        <ExitQueue exit={exitQueue.exitButton} queue={exitQueue.queueList} />
        <Occupancy occupancy={occupancy} />
        <Card classname="aspect-video" size="sm">
          <CardHeader>
            <CardTitle>{t("dashboard.activity-title")}</CardTitle>
            <CardDescription>
              {t("dashboard.activity-description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HistoryList history={activity.documents} />
          </CardContent>
        </Card>
        <Operations operations={operations[0].data} />
      </div>
    </div>
  );
}
