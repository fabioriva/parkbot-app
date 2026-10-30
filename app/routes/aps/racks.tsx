import { requireAps } from "~/lib/authorization.server"
import { ArrowRight, CircleCheck, CircleX, Network } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useOutletContext } from "react-router"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item"
import { NoDataAlert } from "~/components/no-data-alert"
import { PageDataCache } from "~/components/page-data-cache"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import useSWR, { useSWRConfig } from "swr"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/racks"

interface ProfinetNode {
  deviceNr: number
  deviceName: string
  online: { status: boolean | 0 | 1 }
  type: string
  rack?: { nr: number }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAps(request, params.aps, "technical.read")
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks`
  const data: ProfinetNode[] | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function Nodes({ loaderData, params }: Route.ComponentProps) {
  return (
    <PageDataCache key={`${params.aps}:${loaderData.token}`}>
      <NodesContent loaderData={loaderData} params={params} />
    </PageDataCache>
  )
}

function NodesContent({
  loaderData,
  params,
}: Pick<Route.ComponentProps, "loaderData" | "params">) {
  const { plantReady } = useOutletContext<{ plantReady: boolean | null }>()
  const [initialDataValid, setInitialDataValid] = useState(true)
  const { unload } = useSWRConfig()

  useEffect(() => {
    if (plantReady === false) {
      setInitialDataValid(false)
      // Also discard requests still in flight before the interruption.
      unload({ revalidate: false })
    }
  }, [plantReady, unload])

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/racks`
  const { data: racks, error } = useSWR<ProfinetNode[] | null>(
    plantReady === true && loaderData.token ? [url, loaderData.token] : null,
    ([url, token]: [string, string]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      fallbackData: initialDataValid ? loaderData.data : undefined,
      refreshInterval: 1000,
    }
  )
  if (plantReady === false) {
    return <NoDataAlert description={m.racks_connection_unavailable()} />
  }
  if (error || !racks) return <NoDataAlert />

  return (
    <ItemGroup className="w-full gap-3 lg:max-w-xl">
      {racks.map((item) => (
        <Item
          variant="outline"
          className="gap-3 rounded-xl bg-card p-4 sm:flex-nowrap"
          key={item.deviceNr}
          role="listitem"
        >
          <ItemMedia
            variant="icon"
            className="size-9 rounded-lg border bg-muted/40 text-muted-foreground"
          >
            <Network aria-hidden="true" />
          </ItemMedia>
          <ItemContent className="min-w-0 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ItemTitle className="line-clamp-none max-w-full font-semibold [overflow-wrap:anywhere]">
                {item.deviceName}
              </ItemTitle>
              <Badge
                className={
                  item.online.status
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }
              >
                {item.online.status ? (
                  <CircleCheck aria-hidden="true" />
                ) : (
                  <CircleX aria-hidden="true" />
                )}
                {item.online.status ? m.racks_online() : m.racks_offline()}
              </Badge>
            </div>
            <ItemDescription className="line-clamp-none text-xs [overflow-wrap:anywhere]">
              {m.racks_node_details({ nr: item.deviceNr, type: item.type })}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="w-full sm:w-auto">
            <Button
              className="h-9 w-full gap-2 sm:w-auto"
              variant="outline"
              aria-label={m.racks_view_node({ name: item.deviceName })}
              disabled={plantReady !== true || !item.rack}
              render={
                item.rack ? (
                  <Link
                    to={`/aps/${params.aps}/rack/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
                  />
                ) : undefined
              }
            >
              {m.racks_view_io()}
              <ArrowRight aria-hidden="true" />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
