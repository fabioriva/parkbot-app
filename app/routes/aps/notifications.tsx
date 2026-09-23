import { useOutletContext } from "react-router"
import { NoDataAlert } from "~/components/no-data-alert"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"

import type { Route } from "./+types/notifications"

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params.aps}/mailingList`
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export default function Notifications({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData) return <NoDataAlert />

  const context = useOutletContext()
  // console.log(context)

  return <h1>Notifications</h1>
}
