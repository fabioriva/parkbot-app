import { requireAps } from "~/lib/authorization.server"
import { CircleCheck, CircleX } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useOutletContext } from "react-router"
import { Button } from "~/components/ui/button"
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
    <ItemGroup className="w-full gap-3 lg:max-w-sm">
      {racks.map((item) => (
        <Item variant="outline" key={item.deviceNr}>
          <ItemMedia variant="icon">
            {item.online.status ? (
              <CircleCheck className="stroke-green-500" />
            ) : (
              <CircleX className="stroke-red-500" />
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Profinet node {item.deviceName}</ItemTitle>
            <ItemDescription>
              Node {item.deviceNr} Type {item.type}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="sm"
              variant="outline"
              disabled={plantReady !== true || !item.rack}
              render={
                item.rack ? (
                  <Link
                    to={`/aps/${params.aps}/rack/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
                  />
                ) : undefined
              }
            >
              View
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
