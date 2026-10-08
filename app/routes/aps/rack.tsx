import type { ComponentProps } from "react"
import { IoTooltip } from "~/components/io-tooltip"
import { NoDataAlert } from "~/components/no-data-alert"
import { useData } from "~/hooks/use-ws"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"

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

export async function loader({
  params,
  request,
}: Route.LoaderArgs): Promise<RackData | null> {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks/${params?.nr}`
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export default function Rack({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData) return <NoDataAlert />

  return (
    <RackContent
      key={`${params.aps}:${params.nr}`}
      aps={params.aps}
      nr={params.nr}
      initialData={loaderData}
    />
  )
}

function RackContent({
  aps,
  nr,
  initialData,
}: {
  aps: string
  nr: string
  initialData: RackData
}) {
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/racks/${nr}`
  const { data } = useData(url, { initialData })

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
                    <span className="w-12">{bit.addr}</span>
                    <span className="w-16">{bit.label}</span>
                    <span
                      className={`w-3 text-center ${bit.status ? "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300" : "bg-neutral-300 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-300"}`}
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
