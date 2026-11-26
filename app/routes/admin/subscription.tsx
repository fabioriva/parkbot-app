import { AlertCircle, CheckCircle2, PlusIcon, SearchIcon } from "lucide-react"
import { useId, useState } from "react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { CompanySelect } from "~/components/company-select"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Spinner } from "~/components/ui/spinner"
import {
  SubscriptionForm,
  type EditableSubscription,
} from "~/components/subscription-form"
import { SubscriptionDeleteDialog } from "~/components/subscription-delete-dialog"
import { SubscriptionTable } from "~/components/subscription-table"
import { findCompaniesFromAps, findAllAps } from "~/lib/aps.server"
import { requireAdmin } from "~/lib/authorization.server"
import {
  createSubscription,
  deleteSubscriptionByEmail,
  findSubscriptions,
  updateSubscriptionByEmail,
} from "~/lib/subscription.server"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"
import { ALL_COMPANIES } from "~/lib/aps-filter"
import {
  filterSubscriptions,
  subscriptionCompanies,
} from "~/lib/subscription-filter"
import type { Route } from "./+types/subscription"

function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(m.subscription_action_error())
  }
  return value
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request, params.aps)
  try {
    const formData = await request.formData()
    const action = formData.get("action")
    if (action !== "create" && action !== "update" && action !== "delete") {
      throw new Error(m.subscription_action_error())
    }
    const email = getRequiredString(formData, "email")
    if (action === "delete") {
      const result = await deleteSubscriptionByEmail(email)
      if (!result.acknowledged || result.deletedCount !== 1)
        throw new Error(m.subscription_action_error())
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
    }
    if (action === "create") {
      const result = await createSubscription({
        ...subscription,
        subscribed: false,
      })
      if (!result.acknowledged) throw new Error(m.subscription_action_error())
      return {
        action: m.subscription_action_create(),
        success: m.subscription_action_create_success(),
      }
    }
    const result = await updateSubscriptionByEmail(email, subscription)
    if (!result.acknowledged || result.matchedCount !== 1)
      throw new Error(m.subscription_action_error())
    return {
      action: m.subscription_action_update(),
      success: m.subscription_action_update_success(),
    }
  } catch {
    return { error: m.subscription_action_error() }
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request, params.aps)
  const aps = await findAllAps()
  const companies = await findCompaniesFromAps(aps)
  const subscriptions = await findSubscriptions()
  return { aps, companies, subscriptions }
}

type SubscriptionDialog =
  | { action: "create" }
  | { action: "update" | "delete"; subscription: EditableSubscription }

export default function Subscription({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()

  const companyId = useId()
  const searchId = useId()
  const [company, setCompany] = useState(ALL_COMPANIES)
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<SubscriptionDialog | null>(null)
  const busy = fetcher.state !== "idle"
  const openDialog = (nextDialog: SubscriptionDialog) => {
    if (busy) return
    fetcher.reset()
    setDialog(nextDialog)
  }
  const setOpen = (open: boolean) => {
    if (!open && !busy) setDialog(null)
  }

  const filteredSubscriptions = filterSubscriptions(
    loaderData.subscriptions,
    loaderData.aps,
    company,
    search
  )
  const companies = subscriptionCompanies(
    loaderData.subscriptions,
    loaderData.companies
  )
  const inactiveCount = filteredSubscriptions.filter(
    (item) => item.subscribed === false
  ).length
  const numberFormat = new Intl.NumberFormat(getLocale())

  return (
    <>
      <Item
        variant="outline"
        className="mb-3 flex-col items-stretch gap-3 xl:flex-row xl:items-center"
      >
        <ItemContent>
          <ItemTitle>{m.subscriptions_title()}</ItemTitle>
          <ItemDescription className="text-xs tabular-nums">
            {m.subscriptions_description({
              subscriptions: numberFormat.format(filteredSubscriptions.length),
              inactives: numberFormat.format(inactiveCount),
            })}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 xl:flex-initial">
            <Label
              htmlFor={companyId}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {m.subscription_field_company()}
            </Label>
            <div className="min-w-0 flex-1 sm:min-w-40">
              <CompanySelect
                id={companyId}
                allCompanies
                companies={companies}
                company={company}
                setCompany={setCompany}
              />
            </div>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => openDialog({ action: "create" })}
            disabled={busy}
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" /> {m.subscription_action_add()}
          </Button>
        </ItemActions>
      </Item>
      <div className="relative mb-3 w-full sm:max-w-sm">
        <Label htmlFor={searchId} className="sr-only">
          {m.subscriptions_search_label()}
        </Label>
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={m.subscriptions_search_placeholder()}
          className="pl-8"
        />
      </div>
      {busy && (
        <p
          role="status"
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
          {m.subscriptions_working()}
        </p>
      )}
      {!busy && !dialog && fetcher.data?.error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{m.subscription_error_title()}</AlertTitle>
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
      {filteredSubscriptions.length ? (
        <SubscriptionTable
          aps={loaderData.aps}
          busy={busy}
          onUpdate={(subscription) =>
            openDialog({ action: "update", subscription })
          }
          onDelete={(subscription) =>
            openDialog({ action: "delete", subscription })
          }
          subscriptions={filteredSubscriptions}
        />
      ) : (
        <div role="status" className="rounded-xl border px-4 py-8 text-center">
          <p className="text-sm font-medium">{m.subscriptions_no_results()}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {m.subscriptions_no_results_hint()}
          </p>
        </div>
      )}
      {dialog &&
        (dialog.action === "delete" ? (
          <SubscriptionDeleteDialog
            key={dialog.subscription.email}
            subscription={dialog.subscription}
            fetcher={fetcher}
            open
            setOpen={setOpen}
          />
        ) : (
          <SubscriptionForm
            key={
              dialog.action === "update" ? dialog.subscription.email : "create"
            }
            aps={loaderData.aps}
            action={dialog.action}
            fetcher={fetcher}
            open
            setOpen={setOpen}
            selectedSubscription={
              dialog.action === "update" ? dialog.subscription : undefined
            }
          />
        ))}
    </>
  )
}
