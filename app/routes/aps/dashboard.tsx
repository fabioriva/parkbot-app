import { requireAps } from "~/lib/authorization.server"
import { ArrowUpRightIcon } from "lucide-react"
import { useEffect, useState, type ComponentProps } from "react"
import { Link, useOutletContext } from "react-router"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { CardWrapper } from "~/components/card-wrapper"
import { Device, type DeviceData } from "~/components/device"
import { ActionExit } from "~/components/action-exit"
import { ConfirmDialogProvider } from "~/components/confirm-dialog"
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

interface DashboardData {
  activity: {
    documents: ComponentProps<typeof HistoryList>["query"]
  }
  exitQueue: {
    queueList: ComponentProps<typeof Queue>["queue"]
    exitButton: ComponentProps<typeof ActionExit>["exit"]
  }
  occupancy: ComponentProps<typeof Occupancy>["occupancy"]
  operations: {
    data: ComponentProps<typeof Operations>["operations"]
    query: { date: string }
  }[]
  system: Omit<DeviceData, "views">[]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAps(request, params.aps, "read")
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/dashboard`
  const data: DashboardData | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

const ExternalLink = ({ link }: { link: string }) => (
  <Link to={link} aria-label={link}>
    <ArrowUpRightIcon className="size-4 hover:text-blue-500" />
  </Link>
)

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  const [stacked, setStacked] = useState(true)
  // null: waiting for the first PLC status; false: confirmed unavailable.
  const { plantReady } = useOutletContext<{ plantReady: boolean | null }>()
  const [reconnections, setReconnections] = useState(0)

  useEffect(() => {
    if (plantReady === false) setReconnections((value) => value + 1)
  }, [plantReady])

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/dashboard`
  const { data: dashboard, error } = useSWR<DashboardData | null>(
    plantReady === true && loaderData.token
      ? [url, loaderData.token, reconnections]
      : null,
    ([url, token]: [string, string, number]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      // The server snapshot is valid only before the first interruption.
      fallbackData: reconnections === 0 ? loaderData.data : undefined,
      refreshInterval: 1000,
    }
  )

  if (plantReady === false || error || !dashboard) return <NoDataAlert />
  const { activity, exitQueue, occupancy, operations, system } = dashboard
  const [daily] = operations
  if (!daily) return <NoDataAlert />
  const queue = exitQueue.queueList.filter((item) => item.card !== 0)
  const total = (arr: DashboardData["occupancy"]) =>
    arr.reduce((acc, curr) => acc + curr.value, 0)
  return (
    <ConfirmDialogProvider>
      <div className="flex flex-col gap-4">
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {system.map((item, key) => (
            <Device device={{ views: [], ...item }} key={key} />
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
            footer={
              <ActionExit
                exit={exitQueue.exitButton}
                disabled={plantReady !== true}
              />
            }
          >
            <Queue queue={queue} disabled={plantReady !== true} />
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
    </ConfirmDialogProvider>
  )
}
