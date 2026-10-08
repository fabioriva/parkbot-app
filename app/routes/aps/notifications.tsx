import { PlusIcon } from "lucide-react"
import { useState, type ComponentProps } from "react"
import { useFetcher, useOutletContext } from "react-router"
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
import type { Route as ApsLayoutRoute } from "./+types/layout"

const MAX_RECIPIENTS = 3

interface NotificationsData {
  recipients: ComponentProps<typeof NotificationsTable>["recipients"]
}

interface NotificationMutationResponse {
  result: { acknowledged: boolean }
}

export async function action({ params, request }: Route.ActionArgs) {
  try {
    const token = getToken(request)
    const formData = await request.formData()
    const action = formData.get("action")
    const _id = formData.get("_id")
    const email = formData.get("email")
    const name = formData.get("name")
    const locale = formData.get("locale")
    const phone = formData.get("phone")
    if (action === "create") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/add`
      const res: NotificationMutationResponse | null = await fetcher(url, {
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
      if (!res?.result?.acknowledged)
        throw new Error(m.notifications_action_error())
      return {
        action: m.notifications_action_create(),
        success: m.notifications_action_create_success(),
      }
    }
    if (action === "delete") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/delete`
      const res: NotificationMutationResponse | null = await fetcher(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      })
      if (!res?.result?.acknowledged)
        throw new Error(m.notifications_action_error())
      return {
        action: m.notifications_action_delete(),
        success: m.notifications_action_delete_success(),
      }
    }
    if (action === "update") {
      const url = `${process.env.BACKEND_URL}/${params.aps}/notifications/update`
      const res: NotificationMutationResponse | null = await fetcher(url, {
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
      if (!res?.result?.acknowledged)
        throw new Error(m.notifications_action_error())
      return {
        action: m.notifications_action_update(),
        success: m.notifications_action_update_success(),
      }
    }
    throw new Error(m.notifications_action_error())
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : m.notifications_action_error(),
    }
  }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params.aps}/notifications`
  const result: NotificationsData | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return result
}

export default function Notifications({ loaderData }: Route.ComponentProps) {
  const { aps } =
    useOutletContext<Pick<ApsLayoutRoute.ComponentProps["loaderData"], "aps">>()
  const fetcher = useFetcher<typeof action>()
  const [open, setOpen] = useState(false)

  if (!loaderData) return <NoDataAlert />

  if (!aps?.notifications) {
    return m.notifications_disabled()
  }

  const recipients = [...loaderData.recipients].sort((a, b) =>
    a.email.localeCompare(b.email)
  )

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 xl:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.notifications_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.notifications_description({
                count: recipients.length,
                max: MAX_RECIPIENTS,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <Button
          className="w-full"
          onClick={() => setOpen(true)}
          variant="outline"
          disabled={recipients.length >= MAX_RECIPIENTS}
        >
          <PlusIcon /> {m.notifications_action_add()}
        </Button>
      </div>
      <div className="mb-3 hidden xl:block">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.notifications_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.notifications_description({
                count: recipients.length,
                max: MAX_RECIPIENTS,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={() => setOpen(true)} variant="outline">
              <PlusIcon /> {m.notifications_action_add()}
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
