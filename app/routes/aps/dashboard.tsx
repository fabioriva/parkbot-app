import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { CardWrapper } from "~/components/card-wrapper";
import { ExitCall } from "~/components/exit-call";
import { ExitQueue } from "~/components/exit-queue";
import { HistoryList } from "~/components/history-list";
import { NoDataAlert } from "~/components/no-data-alert";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
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
  const [data, setData] = useState(loaderData);
  const fetcher = useFetcher();
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetcher.load(`/aps/${params.aps}/dashboard`);
    }, 1000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  const { activity, exitQueue, occupancy, operations, system } = data;
  const [busy, free, lock] = occupancy;

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
        {system.map((item, key) => (
          <Device device={item} link={`/aps/${params.aps}/devices`} key={key} />
        ))}
      </div> */}
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
        >
          <HistoryList query={activity.documents} />
        </CardWrapper>

        {/* <Occupancy occupancy={occupancy} link={`/aps/${params.aps}/map`} /> */}
        {/* <Card size="sm">
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
        </Card> */}
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
