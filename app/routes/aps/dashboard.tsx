import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { CardWrapper } from "~/components/card-wrapper";
import { Device } from "~/components/device";
import { ExitCall } from "~/components/exit-call";
import { ExitQueue } from "~/components/exit-queue";
import { ExternalLink } from "~/components/external-link";
import { HistoryList } from "~/components/history-list";
import { NoDataAlert } from "~/components/no-data-alert";
import { Occupancy } from "~/components/occupancy-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import useSWR from "swr";

import { m } from "@paraglide/messages.js";

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
  if (!loaderData) return <NoDataAlert />;

  const [dashboard, setDashboard] = useState(loaderData);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/dashboard`;
  const { data } = useSWR(url, fetcher, {
    fallbackData: dashboard,
    refreshInterval: 1000,
  });
  useEffect(() => setDashboard(data), [data]);

  const { activity, exitQueue, occupancy, operations, system } = dashboard;
  const [busy, free, lock] = occupancy;
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
            exitQueue.queueList.length === 0
              ? m.exit_queue_no_calls()
              : m.exit_queue_calls({ count: exitQueue.queueList.length })
          }
          footer={<ExitCall exit={exitQueue.exitButton} />}
        >
          <ExitQueue
            exit={exitQueue.exitButton}
            queue={exitQueue.queueList.filter((item) => item.card !== 0)}
          />
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
        {/* <Operations
          operations={operations[0].data}
          link={`/aps/${params.aps}/operations`}
          title={t("dashboard.operations-title")}
          description={t("dashboard.operations-description", {
            date: format(new Date(), "MM/dd/yyyy"),
            interpolation: { escapeValue: false },
          })}
        /> */}
      </div>
    </div>
  );
}
