import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { CardWrapper } from "~/components/card-wrapper";
import { Device } from "~/components/device";
import { ExitCall } from "~/components/exit-call";
import { ExitQueue } from "~/components/exit-queue";
import { ExternalLink } from "~/components/external-link";
import { HistoryList } from "~/components/history-list";
import { NoDataAlert } from "~/components/no-data-alert";
import { Occupancy } from "~/components/occupancy-chart";
import { Operations } from "~/components/operations-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import useSWR from "swr";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/dashboard`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;

  const [dashboard, setDashboard] = useState(loaderData.data);
  const [stacked, setStacked] = useState(true);

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/dashboard`;
  const { data } = useSWR(url, fetcher, {
    fallbackData: dashboard,
    refreshInterval: 1000,
  });
  useEffect(() => setDashboard(data), [data]);
  const { activity, exitQueue, occupancy, operations, system } = dashboard;

  const daily = operations[0];
  const [busy, free, lock] = occupancy;
  const queue = exitQueue.queueList.filter((item) => item.card !== 0);
  const total = (arr) => arr.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        {system.map((item, key) => (
          <Device device={item} key={key} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        <CardWrapper
          title={m.exit_queue_card_title()}
          description={
            queue.length === 0
              ? m.exit_queue_no_calls()
              : m.exit_queue_calls({ count: queue.length })
          }
          footer={<ExitCall exit={exitQueue.exitButton} />}
        >
          <ExitQueue exit={exitQueue.exitButton} queue={queue} />
        </CardWrapper>
        <CardWrapper
          title={m.dashboard_recent_activity_title()}
          description={m.dashboard_recent_activity_description()}
          action={<ExternalLink link={`/aps/${params.aps}/history`} />}
        >
          <HistoryList query={activity.documents} />
        </CardWrapper>
        <CardWrapper
          title={m.occupancy_title()}
          description={m.occupancy_total_count({ count: total(occupancy) })}
          action={<ExternalLink link={`/aps/${params.aps}/map`} />}
        >
          <Occupancy occupancy={occupancy} />
        </CardWrapper>
        <CardWrapper
          title={m.operations_card_title()}
          description={m.operations_daily_card_description({
            date: daily.query.date,
          })}
          action={<ExternalLink link={`/aps/${params.aps}/operations`} />}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Label htmlFor="stacked">Stacked</Label>
              <Switch
                id="stacked"
                checked={stacked}
                onCheckedChange={setStacked}
              />
            </div>
          }
        >
          <Operations operations={daily.data} stacked={stacked} />
        </CardWrapper>
      </div>
    </div>
  );
}
