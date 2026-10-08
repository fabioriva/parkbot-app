import { Device, type DeviceData } from "~/components/device"
import { NoDataAlert } from "~/components/no-data-alert"
import { getToken } from "~/lib/cookie.server"
import { useData } from "~/hooks/use-ws"
import fetcher from "~/lib/fetch"

import type { Route } from "./+types/devices"
import { clsx } from "cn"

interface OverviewData {
  devices: DeviceData[][]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/overview`
  const data: OverviewData | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function Devices({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />
  return (
    <DevicesOverview
      key={params.aps}
      aps={params.aps}
      initialData={loaderData.data}
    />
  )
}

function DevicesOverview({
  aps,
  initialData,
}: {
  aps: string
  initialData: OverviewData
}) {
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/overview`
  const { data } = useData(url, { initialData })
  const COLS = data.devices[0]?.length ?? 0
  return (
    <div
      className={clsx("grid-col-1 grid gap-4 lg:grid-cols-2", {
        "xl:grid-cols-2": COLS <= 2,
        "xl:grid-cols-3": COLS === 3,
        "xl:grid-cols-4": COLS >= 4,
      })}
    >
      {data.devices.flat(1).map((item, key) => (
        <Device advanced device={item} key={key} />
      ))}
    </div>
  )
}
