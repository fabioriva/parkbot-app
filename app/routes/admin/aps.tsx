import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { ApsForm } from "~/components/aps-form"
import { ApsTable } from "~/components/aps-table"
import { CompanySelect } from "~/components/company-select"
import { Error as ErrorAlert } from "~/components/error-alert"
import { Success } from "~/components/success-alert"
import {
  createAps,
  deleteApsByNs,
  findCompaniesFromAps,
  findSubscribedApsList,
  updateApsByNs,
} from "~/lib/aps.server"
import { requireAdmin } from "~/lib/authorization.server"
import { isValidTimeZone } from "~/lib/date-time"
import { m } from "@paraglide/messages.js"
import type { Route } from "./+types/aps"

function getRequiredString(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(m.aps_action_error())
  }
  return value
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request)
  try {
    const formData = await request.formData()
    const action = formData.get("action")
    if (action !== "create" && action !== "update" && action !== "delete") {
      throw new Error(m.aps_action_error())
    }
    const ns = getRequiredString(formData, "ns")
    if (action === "delete") {
      await deleteApsByNs(ns)
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
      await createAps(aps)
      return {
        action: m.aps_action_create(),
        success: m.aps_action_create_success(),
      }
    }
    await updateApsByNs(aps, ns)
    return {
      action: m.aps_action_update(),
      success: m.aps_action_update_success(),
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : m.aps_action_error(),
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request)
  const aps = await findSubscribedApsList([])
  const companies = await findCompaniesFromAps(aps)
  return { aps, companies }
}

export default function Aps({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()

  const [company, setCompany] = useState("Sotefin")
  const [open, setOpen] = useState(false)

  const apsByCompany = loaderData.aps.filter(
    (item) => item.company === company || company === "Sotefin"
  )

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 xl:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.aps_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.aps_description({
                aps: apsByCompany.length,
                spaces: apsByCompany.reduce((accumulator, currentValue) => {
                  return accumulator + Number(currentValue.parkingSpaces)
                }, 0),
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
            <PlusIcon /> {m.aps_action_add()}
          </Button>
        </div>
      </div>
      <div className="mb-3 hidden xl:block">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.aps_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.aps_description({
                aps: apsByCompany.length,
                spaces: apsByCompany.reduce((accumulator, currentValue) => {
                  return accumulator + Number(currentValue.parkingSpaces)
                }, 0),
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
              <PlusIcon /> {m.aps_action_add()}
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
        <ApsTable aps={apsByCompany} fetcher={fetcher} />
      </div>
      <ApsForm
        action="create"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
