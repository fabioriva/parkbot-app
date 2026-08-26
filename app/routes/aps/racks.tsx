import { CircleCheck, CircleX } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router"
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
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import useSWR from "swr"

import type { Route } from "./+types/racks"

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks`
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function Nodes({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />

  const [racks, setRacks] = useState(loaderData.data)

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/racks`
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
  useEffect(() => setRacks(data), [data])

  if (!racks) return <NoDataAlert />

  return (
    <ItemGroup className="w-full gap-3 lg:max-w-sm">
      {data.map((item) => (
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
              render={
                <Link
                  to={`/aps/${params.aps}/rack/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
                />
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
