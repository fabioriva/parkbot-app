import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { /*data,*/ useFetcher, useOutletContext } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { Error as ErrorAlert } from "~/components/error-alert"
import { Success } from "~/components/success-alert"
import { NoDataAlert } from "~/components/no-data-alert"
import { NotificationsForm } from "~/components/notifications-form"
import { NotificationsTable } from "~/components/notifications-table"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/notifications"

export async function action({ params, request }: Route.ActionArgs) {
  try {
    const token = getToken(request)
    console.log(token)

    const formData = await request.formData()
    console.log(formData)
    const action = formData.get("action")
    const _id = formData.get("_id")
    const email = formData.get("email")
    const name = formData.get("name")
    const locale = formData.get("locale")
    const phone = formData.get("phone")
    if (action === "create") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/add`
      const res = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          locale,
          phone,
        }),
      })
      return {
        action: m.subscription_action_create(),
        success: m.subscription_action_create_success(),
      }
    }
    if (action === "delete") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/delete`
      const res = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      })
      return {
        action: m.subscription_action_delete(),
        success: m.subscription_action_delete_success(),
      }
    }
    if (action === "update") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/update`
      const res = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          locale,
          phone,
        }),
      })
      return {
        action: m.subscription_action_update(),
        success: m.subscription_action_update_success(),
      }
    }
    throw new Error(m.subscription_action_error())
  } catch (error) {
    console.log(error)
    return { error: error?.message }
  }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params.aps}/notifications`
  const result = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  console.log(result)
  return result
  // const data = [
  //   {
  //     _id: "620f1c93b24203b82edc41f4",
  //     email: "peter.manis@parkplusinc.com",
  //     locale: "en",
  //     name: "Peter Manis",
  //     phone: "7323978141",
  //   },
  //   {
  //     _id: "629b8a3d1047635d4f0912dc",
  //     email: "juancarlos.penton@parkplusinc.com",
  //     locale: "en",
  //     name: "Juan Carlos Penton",
  //     phone: "",
  //   },
  //   {
  //     _id: "69a9dbbe497c8edd76bbd3c5",
  //     email: "musealerts@parkplusinc.com",
  //     locale: "en",
  //     name: "park plus",
  //     phone: null,
  //   },
  // ]
  // return data
}

export default function Notifications({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData) return <NoDataAlert />

  const { aps } = useOutletContext()
  if (!aps?.notifications) {
    return <h1>Le notifiche per questo sistema non sono abilitate.</h1>
  }

  // if (loaderData.recipients.length === 0) return <h1>Empty list</h1>

  const fetcher = useFetcher()
  const [open, setOpen] = useState(false)

  const recipients = [...loaderData.recipients].sort((a, b) =>
    a.email.localeCompare(b.email)
  )

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 xl:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.users_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.users_description({
                count: recipients.length,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <Button
          className="w-full"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          <PlusIcon /> {m.subscription_action_add()}
        </Button>
      </div>
      <div className="mb-3 hidden xl:block">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.subscriptions_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.users_description({
                count: recipients.length,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={() => setOpen(true)} variant="outline">
              <PlusIcon /> {m.subscription_action_add()}
            </Button>
          </ItemActions>
        </Item>
      </div>

      {fetcher.data?.error && (
        <ErrorAlert description={fetcher.data.error} title="Error" />
      )}
      {fetcher.data?.success && (
        <Success
          description={fetcher.data.success}
          title={fetcher.data.action}
        />
      )}
      <div className="overflow-hidden rounded-lg border">
        <NotificationsTable fetcher={fetcher} recipients={recipients} />
      </div>
      <NotificationsForm
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
