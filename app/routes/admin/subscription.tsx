import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { CompanySelect } from "~/components/company-select"
import { Error as ErrorAlert } from "~/components/error-alert"
import { SubscriptionForm } from "~/components/subscription-form"
import { SubscriptionTable } from "~/components/subscription-table"
import { Success } from "~/components/success-alert"
// import { aps } from "~/lib/aps";
import { findCompaniesFromAps, findSubscribedApsList } from "~/lib/aps.server"
import { requireAdmin } from "~/lib/authorization.server"
import {
  createSubscription,
  deleteSubscriptionByEmail,
  findSubscriptions,
  updateSubscriptionByEmail,
} from "~/lib/subscription.server"
import { m } from "@paraglide/messages.js"
import type { Route } from "./+types/subscription"

function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(m.subscription_action_error())
  }
  return value
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  try {
    const formData = await request.formData()
    const action = formData.get("action")
    if (action !== "create" && action !== "update" && action !== "delete") {
      throw new Error(m.subscription_action_error())
    }
    const email = getRequiredString(formData, "email")
    if (action === "delete") {
      await deleteSubscriptionByEmail(email)
      return {
        action: m.subscription_action_delete(),
        success: m.subscription_action_delete_success(),
      }
    }
    const aps = formData.getAll("aps").map((value) => {
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(m.subscription_action_error())
      }
      return value
    })
    const subscription = {
      aps,
      company: getRequiredString(formData, "company"),
      email,
      role: getRequiredString(formData, "role"),
      subscribed: false,
    }
    if (action === "create") {
      await createSubscription(subscription)
      return {
        action: m.subscription_action_create(),
        success: m.subscription_action_create_success(),
      }
    }
    await updateSubscriptionByEmail(email, subscription)
    return {
      action: m.subscription_action_update(),
      success: m.subscription_action_update_success(),
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : m.subscription_action_error(),
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)
  const aps = await findSubscribedApsList([])
  const companies = await findCompaniesFromAps(aps)
  const subscriptions = await findSubscriptions()
  return { aps, companies, subscriptions }
}

export default function Subscription({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()

  const [company, setCompany] = useState("Sotefin")
  const [open, setOpen] = useState(false)

  const inactiveSubscriptions = loaderData.subscriptions.filter(
    (item) => item.subscribed === false
  )

  const subscriptionsByCompany = loaderData.subscriptions.filter(
    (item) => item.company === company || company === "Sotefin"
  )

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 xl:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.subscriptions_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.subscriptions_description({
                inactives: inactiveSubscriptions.length,
                subscriptions: subscriptionsByCompany.length,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <div className="flex gap-3">
          <CompanySelect
            companies={loaderData.companies}
            company={company}
            setCompany={setCompany}
          />
          <Button onClick={() => setOpen(true)} variant="outline">
            <PlusIcon /> {m.subscription_action_add()}
          </Button>
        </div>
      </div>
      <div className="mb-3 hidden xl:block">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.subscriptions_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.subscriptions_description({
                inactives: inactiveSubscriptions.length,
                subscriptions: subscriptionsByCompany.length,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <CompanySelect
              companies={loaderData.companies}
              company={company}
              setCompany={setCompany}
            />
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
        <SubscriptionTable
          aps={loaderData.aps}
          fetcher={fetcher}
          subscriptions={subscriptionsByCompany}
        />
      </div>
      <SubscriptionForm
        aps={loaderData.aps}
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
