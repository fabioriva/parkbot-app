import { requireAps } from "~/lib/authorization.server"
import { useEffect, useRef, useState, type ComponentProps } from "react"
import { useOutletContext } from "react-router"
import useSWR, { useSWRConfig } from "swr"
import { IoTooltip } from "~/components/io-tooltip"
import { NoDataAlert } from "~/components/no-data-alert"
import { PageDataCache } from "~/components/page-data-cache"
import { connectReconnectingWebSocket } from "~/hooks/use-ws"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/rack"

interface RackData {
  cards: {
    nr: number
    type: string
    bytes: {
      label: string
      bits: NonNullable<ComponentProps<typeof IoTooltip>["io"]>[]
    }[]
  }[]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAps(request, params.aps, "technical.read")
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks/${params?.nr}`
  const data: RackData | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function Rack({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />

  return (
    <PageDataCache key={`${params.aps}:${params.nr}:${loaderData.token}`}>
      <RackContent
        aps={params.aps}
        nr={params.nr}
        initialData={loaderData.data}
        token={loaderData.token}
      />
    </PageDataCache>
  )
}

function RackContent({
  aps,
  nr,
  initialData,
  token,
}: {
  aps: string
  nr: string
  initialData: RackData
  token: string | null
}) {
  const { plantReady } = useOutletContext<{ plantReady: boolean | null }>()
  const [rackConnected, setRackConnected] = useState<boolean | null>(null)
  const [initialDataValid, setInitialDataValid] = useState(true)
  const { unload } = useSWRConfig()
  const ready = plantReady === true && rackConnected === true
  const readyRef = useRef(ready)
  const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/racks/${nr}`
  const { data, error, mutate } = useSWR<RackData>(
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
    if (plantReady === false || rackConnected === false) {
      setInitialDataValid(false)
      unload({ revalidate: false })
    }
  }, [plantReady, rackConnected, ready, unload])

  useEffect(() => {
    setRackConnected(null)
    return connectReconnectingWebSocket(
      `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/racks/${nr}`,
      {
        onOpen: () => setRackConnected(true),
        onClose: () => {
          readyRef.current = false
          setRackConnected(false)
        },
        onMessage: (event) => {
          if (!readyRef.current) return
          // Live updates replace the snapshot without starting another HTTP read.
          void mutate(JSON.parse(event.data), { revalidate: false })
        },
      },
      token ?? undefined
    )
  }, [aps, nr, token, mutate])

  if (plantReady === false || rackConnected === false) {
    return <NoDataAlert description={m.rack_connection_unavailable()} />
  }
  if (error || !data) return <NoDataAlert />

  return (
    <div className="flex gap-0.5 overflow-scroll py-3">
      {data.cards.map((card) => (
        <div
          className="flex flex-col gap-0.5 rounded-xs border bg-card p-1 text-xs"
          key={card.nr}
        >
          <p className="text-[0.625rem]">{card.type}</p>
          {card.bytes.map((byte) => (
            <div className="flex flex-col gap-0.5" key={byte.label}>
              <p className="mt-1.5">
                {byte.label.substring(0, 1) + "B" + byte.label.substring(1)}
              </p>
              {byte.bits.map((bit) => (
                <IoTooltip io={bit} key={bit.addr}>
                  <div className="flex border bg-white dark:bg-neutral-950">
                    <span className="w-12 tabular-nums">{bit.addr}</span>
                    <span className="w-16">{bit.label}</span>
                    <span
                      className={`w-3 tabular-nums ${bit.status ? "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300" : "bg-neutral-300 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-300"}`}
                    >
                      {bit.addr.slice(-1)}
                    </span>
                  </div>
                </IoTooltip>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
