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
import { ApsForm, type EditableAps } from "~/components/aps-form"
import { ApsDeleteDialog } from "~/components/aps-delete-dialog"
import { ApsTable } from "~/components/aps-table"
import { CompanySelect } from "~/components/company-select"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Spinner } from "~/components/ui/spinner"
import {
  createAps,
  deleteApsByNs,
  findCompaniesFromAps,
  findAllAps,
  updateApsByNs,
} from "~/lib/aps.server"
import { requireAdmin } from "~/lib/authorization.server"
import { isValidTimeZone } from "~/lib/date-time"
import { ALL_COMPANIES, filterAps } from "~/lib/aps-filter"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"
import type { Route } from "./+types/aps"

function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(m.aps_action_error())
  }
  return value
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request, params.aps)
  try {
    const formData = await request.formData()
    const action = formData.get("action")
    if (action !== "create" && action !== "update" && action !== "delete") {
      throw new Error(m.aps_action_error())
    }
    const ns = getRequiredString(formData, "ns")
    if (action === "delete") {
      const result = await deleteApsByNs(ns)
      if (!result.acknowledged || result.deletedCount !== 1)
        throw new Error(m.aps_action_error())
      return {
        action: m.aps_action_delete(),
        success: m.aps_action_delete_success(),
      }
    }
    const timeZoneValue = formData.get("timeZone")
    const timeZone =
      typeof timeZoneValue === "string" ? timeZoneValue.trim() : ""
    if (!isValidTimeZone(timeZone)) {
      return { error: m.aps_time_zone_invalid() }
    }
    const parkingSpaces = Number(getRequiredString(formData, "parkingSpaces"))
    if (!Number.isFinite(parkingSpaces)) {
      throw new Error(m.aps_action_error())
    }
    const aps = {
      city: getRequiredString(formData, "city"),
      company: getRequiredString(formData, "company"),
      country: getRequiredString(formData, "country"),
      flag: getRequiredString(formData, "flag"),
      name: getRequiredString(formData, "name"),
      notifications: Boolean(formData.get("notifications")),
      ns,
      parkingSpaces,
      timeZone,
    }
    if (action === "create") {
      const result = await createAps(aps)
      if (!result.acknowledged) throw new Error(m.aps_action_error())
      return {
        action: m.aps_action_create(),
        success: m.aps_action_create_success(),
      }
    }
    const result = await updateApsByNs(aps, ns)
    if (!result.acknowledged || result.matchedCount !== 1)
      throw new Error(m.aps_action_error())
    return {
      action: m.aps_action_update(),
      success: m.aps_action_update_success(),
    }
  } catch {
    return { error: m.aps_action_error() }
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request, params.aps)
  const aps = await findAllAps()
  const companies = await findCompaniesFromAps(aps)
  return { aps, companies }
}

type ApsDialog =
  { action: "create" } | { action: "update" | "delete"; aps: EditableAps }

export default function Aps({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()

  const companyId = useId()
  const searchId = useId()
  const [company, setCompany] = useState(ALL_COMPANIES)
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<ApsDialog | null>(null)
  const busy = fetcher.state !== "idle"
  const openDialog = (nextDialog: ApsDialog) => {
    if (busy) return
    fetcher.reset()
    setDialog(nextDialog)
  }
  const setOpen = (open: boolean) => {
    if (!open && !busy) setDialog(null)
  }

  const filteredAps = filterAps(loaderData.aps, company, search)

  const totalSpaces = filteredAps.reduce(
    (sum, item) => sum + Number(item.parkingSpaces),
    0
  )
  const numberFormat = new Intl.NumberFormat(getLocale())

  return (
    <>
      <Item
        variant="outline"
        className="mb-3 flex-col items-stretch gap-3 xl:flex-row xl:items-center"
      >
        <ItemContent>
          <ItemTitle>{m.aps_title()}</ItemTitle>
          <ItemDescription className="text-xs tabular-nums">
            {m.aps_description({
              aps: numberFormat.format(filteredAps.length),
              spaces: numberFormat.format(totalSpaces),
            })}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 xl:flex-initial">
            <Label
              htmlFor={companyId}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {m.aps_field_company()}
            </Label>
            <div className="min-w-0 flex-1 sm:min-w-40">
              <CompanySelect
                id={companyId}
                allCompanies
                companies={loaderData.companies}
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
            <PlusIcon data-icon="inline-start" /> {m.aps_action_add()}
          </Button>
        </ItemActions>
      </Item>
      <div className="relative mb-3 w-full sm:max-w-sm">
        <Label htmlFor={searchId} className="sr-only">
          {m.aps_search_label()}
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
          placeholder={m.aps_search_placeholder()}
          className="pl-8"
        />
      </div>
      {busy && (
        <p
          role="status"
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
          {m.aps_working()}
        </p>
      )}
      {!busy && !dialog && fetcher.data?.error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{m.aps_error_title()}</AlertTitle>
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
      {filteredAps.length ? (
        <ApsTable
          aps={filteredAps}
          busy={busy}
          onUpdate={(aps) => openDialog({ action: "update", aps })}
          onDelete={(aps) => openDialog({ action: "delete", aps })}
        />
      ) : (
        <div role="status" className="rounded-xl border px-4 py-8 text-center">
          <p className="text-sm font-medium">{m.aps_no_results()}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {m.aps_no_results_hint()}
          </p>
        </div>
      )}
      {dialog &&
        (dialog.action === "delete" ? (
          <ApsDeleteDialog
            key={dialog.aps.ns}
            aps={dialog.aps}
            fetcher={fetcher}
            open
            setOpen={setOpen}
          />
        ) : (
          <ApsForm
            key={dialog.action === "update" ? dialog.aps.ns : "create"}
            action={dialog.action}
            fetcher={fetcher}
            open
            setOpen={setOpen}
            selectedAps={dialog.action === "update" ? dialog.aps : undefined}
          />
        ))}
    </>
  )
}
