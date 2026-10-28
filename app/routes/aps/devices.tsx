import { requireAps } from "~/lib/authorization.server"
import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router"
import useSWR, { useSWRConfig } from "swr"
import { ConfirmDialogProvider } from "~/components/confirm-dialog"
import { Device, type DeviceData } from "~/components/device"
import { NoDataAlert } from "~/components/no-data-alert"
import { PageDataCache } from "~/components/page-data-cache"
import { getToken } from "~/lib/cookie.server"
import { connectReconnectingWebSocket } from "~/hooks/use-ws"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/devices"
import { clsx } from "cn"

interface OverviewData {
  devices: DeviceData[][]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAps(request, params.aps, "technical.read")
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
    <PageDataCache key={`${params.aps}:${loaderData.token}`}>
      <DevicesOverview
        aps={params.aps}
        initialData={loaderData.data}
        token={loaderData.token}
      />
    </PageDataCache>
  )
}

function DevicesOverview({
  aps,
  initialData,
  token,
}: {
  aps: string
  initialData: OverviewData
  token: string | null
}) {
  const { plantReady } = useOutletContext<{ plantReady: boolean | null }>()
  const [overviewConnected, setOverviewConnected] = useState<boolean | null>(
    null
  )
  const [initialDataValid, setInitialDataValid] = useState(true)
  const { unload } = useSWRConfig()
  const ready = plantReady === true && overviewConnected === true
  const readyRef = useRef(ready)
  const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/overview`
  const { data, error, mutate } = useSWR<OverviewData>(
    ready && token ? [url, token] : null,
    ([url, token]: [string, string]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      fallbackData: initialDataValid ? initialData : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  useEffect(() => {
    readyRef.current = ready
    if (plantReady === false || overviewConnected === false) {
      setInitialDataValid(false)
      unload({ revalidate: false })
    }
  }, [plantReady, overviewConnected, ready, unload])

  useEffect(() => {
    setOverviewConnected(null)
    return connectReconnectingWebSocket(
      `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/overview`,
      {
        onOpen: () => setOverviewConnected(true),
        onClose: () => {
          readyRef.current = false
          setOverviewConnected(false)
        },
        onMessage: (event) => {
          if (!readyRef.current) return
          // Live updates replace the snapshot without starting another HTTP read.
          void mutate(JSON.parse(event.data), { revalidate: false })
        },
      },
      token ?? undefined
    )
  }, [aps, token, mutate])

  if (plantReady === false || overviewConnected === false) {
    return <NoDataAlert description={m.devices_connection_unavailable()} />
  }
  if (error || !data) return <NoDataAlert />

  const COLS = data.devices[0]?.length ?? 0
  return (
    <ConfirmDialogProvider>
      <div
        className={clsx("grid-col-1 grid gap-4 lg:grid-cols-2", {
          "xl:grid-cols-2": COLS <= 2,
          "xl:grid-cols-3": COLS === 3,
          "xl:grid-cols-4": COLS >= 4,
        })}
      >
        {data.devices.flat(1).map((item, key) => (
          <Device advanced device={item} disabled={!ready} key={key} />
        ))}
      </div>
    </ConfirmDialogProvider>
  )
}
