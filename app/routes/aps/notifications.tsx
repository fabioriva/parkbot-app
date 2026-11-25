import { requireAps } from "~/lib/authorization.server"
import { BellOff, CheckCircle2, AlertCircle, PlusIcon } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Spinner } from "~/components/ui/spinner"
import { NoDataAlert } from "~/components/no-data-alert"
import {
  NotificationsForm,
  type NotificationRecipient,
} from "~/components/notifications-form"
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
  result: { acknowledged: boolean; matchedCount?: number }
}

export async function action({ params, request }: Route.ActionArgs) {
  await requireAps(request, params.aps, "notifications")
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
      if (!res?.result?.acknowledged || res.result.matchedCount === 0)
        throw new Error(m.notifications_action_error())
      return {
        action: m.notifications_action_update(),
        success: m.notifications_action_update_success(),
      }
    }
    throw new Error(m.notifications_action_error())
  } catch (error) {
    if (error instanceof Response) {
      if (error.status === 401 || error.status === 403) throw error
      return { error: m.notifications_action_error() }
    }
    return { error: m.notifications_action_error() }
  }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireAps(request, params.aps, "notifications")
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
  const [selectedRecipient, setSelectedRecipient] =
    useState<NotificationRecipient>()
  const busy = fetcher.state !== "idle"

  const openForm = (recipient?: NotificationRecipient) => {
    if (busy) return
    fetcher.reset()
    setSelectedRecipient(recipient)
    setOpen(true)
  }
  const deleteRecipient = (recipient: NotificationRecipient) => {
    if (busy) return
    fetcher.reset()
    void fetcher.submit(
      { action: "delete", _id: recipient._id },
      { method: "post" }
    )
  }

  if (!loaderData) return <NoDataAlert />

  if (!aps?.notifications) {
    return (
      <Alert role="status" className="bg-muted/30">
        <BellOff aria-hidden="true" />
        <AlertTitle>{m.notifications_disabled_title()}</AlertTitle>
        <AlertDescription>{m.notifications_disabled()}</AlertDescription>
      </Alert>
    )
  }

  const recipients = [...loaderData.recipients].sort((a, b) =>
    a.email.localeCompare(b.email)
  )
  const atLimit = recipients.length >= MAX_RECIPIENTS

  return (
    <>
      <Item
        variant="outline"
        className="mb-3 flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      >
        <ItemContent>
          <ItemTitle>{m.notifications_title()}</ItemTitle>
          <ItemDescription className="text-xs tabular-nums">
            {m.notifications_description({
              count: recipients.length,
              max: MAX_RECIPIENTS,
            })}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto"
            onClick={() => openForm()}
            variant="outline"
            disabled={busy || atLimit}
            aria-describedby={atLimit ? "notifications-limit" : undefined}
          >
            <PlusIcon data-icon="inline-start" /> {m.notifications_action_add()}
          </Button>
        </ItemActions>
      </Item>
      {atLimit && (
        <p
          id="notifications-limit"
          className="mb-3 text-xs text-muted-foreground"
        >
          {m.notifications_limit({ max: MAX_RECIPIENTS })}
        </p>
      )}
      {busy && (
        <p
          role="status"
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
          {m.notifications_working()}
        </p>
      )}
      {!busy && !open && fetcher.data?.error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{m.notifications_error_title()}</AlertTitle>
          <AlertDescription>{fetcher.data.error}</AlertDescription>
        </Alert>
      )}
      {!busy && fetcher.data?.success && (
        <Alert
          role="status"
          className="mb-3 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>{fetcher.data.action}</AlertTitle>
          <AlertDescription className="text-inherit">
            {fetcher.data.success}
          </AlertDescription>
        </Alert>
      )}
      <NotificationsTable
        recipients={recipients}
        busy={busy}
        onUpdate={openForm}
        onDelete={deleteRecipient}
      />
      {open && (
        <NotificationsForm
          key={selectedRecipient?._id ?? "create"}
          action={selectedRecipient ? "update" : "create"}
          fetcher={fetcher}
          open={open}
          setOpen={setOpen}
          selectedRecipient={selectedRecipient}
        />
      )}
    </>
  )
}
