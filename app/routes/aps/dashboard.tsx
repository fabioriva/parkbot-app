import { ArrowUpRightIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { CardWrapper } from "~/components/card-wrapper"
import { Device } from "~/components/device"
import { ActionExit } from "~/components/action-exit"
import { HistoryList } from "~/components/history-list"
import { NoDataAlert } from "~/components/no-data-alert"
import { Occupancy } from "~/components/occupancy-chart"
import { Operations } from "~/components/operations-chart"
import { Queue } from "~/components/queue"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import useSWR from "swr"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/dashboard"

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/dashboard`
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

const ExternalLink = ({ link }) => (
  <Link to={link} aria-label={link}>
    <ArrowUpRightIcon className="size-4 hover:text-blue-500" />
  </Link>
)

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />
  const [dashboard, setDashboard] = useState(loaderData.data)
  const [stacked, setStacked] = useState(true)

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/dashboard`
  const { data } = useSWR(
    loaderData.token ? [url, loaderData.token] : null,
    ([url, token]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${loaderData.token}` },
      }),
    {
      fallbackData: loaderData.data,
      refreshInterval: 1000,
    }
  )
  useEffect(() => setDashboard(data), [data])

  if (!dashboard) return <NoDataAlert />
  const { activity, exitQueue, occupancy, operations, system } = dashboard
  const [daily] = operations
  const [busy, free, lock] = occupancy
  const queue = exitQueue.queueList.filter((item) => item.card !== 0)
  const total = (arr) => arr.reduce((acc, curr) => acc + curr.value, 0)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {system.map((item, key) => (
          <Device device={item} key={key} />
        ))}
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <CardWrapper
          title={m.exit_queue_card_title()}
          description={
            queue.length === 0
              ? m.exit_queue_no_calls()
              : m.exit_queue_calls({ count: queue.length })
          }
          footer={<ActionExit exit={exitQueue.exitButton} />}
        >
          <Queue exit={exitQueue.exitButton} queue={queue} />
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
            <div className="flex w-full items-center justify-end gap-2">
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
  )
}
