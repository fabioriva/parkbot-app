import { format } from "date-fns";
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
import { ExternalLink } from "~/components/external-link-button";
import { HistoryList } from "~/components/history-list";
import { Occupancy } from "~/components/occupancy-chart";
import { Operations } from "~/components/operations-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/dashboard`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

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
  const clientFetcher = useFetcher();

  useEffect(() => {
    const intervalId = setInterval(() => {
      clientFetcher.load(`/aps/${params.aps}/dashboard`);
    }, 2500);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (clientFetcher.data) {
      setData(clientFetcher.data);
    }
  }, [clientFetcher.data]);

  const { activity, exitQueue, occupancy, operations, system } = data;
  const [busy, free, lock] = occupancy;
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        {system.map((item, key) => (
          <Device device={item} link={`/aps/${params.aps}/devices`} key={key} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        <ExitQueue
          exit={exitQueue.exitButton}
          queue={exitQueue.queueList.filter((item) => item.card !== 0)}
        />
        <Occupancy occupancy={occupancy} link={`/aps/${params.aps}/map`} />
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("dashboard.activity-title")}</CardTitle>
            <CardDescription>
              {t("dashboard.activity-description")}
            </CardDescription>
            <CardAction className="flex items-center gap-2">
              <ExternalLink link={`/aps/${params.aps}/history`} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <HistoryList query={activity.documents} />
          </CardContent>
        </Card>
        <Operations
          operations={operations[0].data}
          title="Daily operations"
          description={format(new Date(), "MM/dd/yyyy")}
          link={`/aps/${params.aps}/operations`}
        />
      </div>
    </div>
  );
}
