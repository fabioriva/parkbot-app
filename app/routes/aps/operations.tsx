import { data as routeData, redirect } from "react-router"
import { useState } from "react"
import type { DateRange as DateRangeValue } from "react-day-picker"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { CardWrapper } from "~/components/card-wrapper"
import { DateRange } from "~/components/date-range"
import { Operations as OperationsChart } from "~/components/operations-chart"
import { Error as ErrorAlert } from "~/components/error-alert"
import { NoDataAlert } from "~/components/no-data-alert"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import { auth } from "~/lib/auth.server"
import {
  buildPlantDateRangeQuery,
  calendarDate,
  getDefaultPlantDateRange,
  isValidTimeZone,
  type PlantDateRange,
} from "~/lib/date-time"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/operations"

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return redirect("/signin")
  if (!("aps" in session.user) || session.user.aps !== params.aps)
    throw routeData("Forbidden", { status: 403 })
  const token = getToken(request)
  const timeZone = session.aps?.timeZone
  if (!isValidTimeZone(timeZone))
    return { data: null, token, timeZone: null, range: null }

  const range = getDefaultPlantDateRange(timeZone, 7)
  const query = new URLSearchParams(buildPlantDateRangeQuery(range, timeZone))
  const url = `${process.env.BACKEND_URL}/${params.aps}/statistics?${query}`
  const data = await fetcher(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (data && data.operations?.query?.timeZone !== timeZone)
    throw routeData(
      "Statistics time zone does not match the plant configuration",
      {
        status: 502,
      }
    )
  return { data, token, timeZone, range }
}

export default function Operations({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData.timeZone || !loaderData.range)
    return (
      <ErrorAlert
        title={m.aps_field_time_zone()}
        description={m.aps_time_zone_missing()}
      />
    )
  if (!loaderData.data) return <NoDataAlert />
  return (
    <OperationsResults
      key={`${params.aps}:${loaderData.timeZone}:${loaderData.range.from}:${loaderData.range.to}`}
      loaderData={loaderData}
      params={params}
      timeZone={loaderData.timeZone}
      initialRange={loaderData.range}
    />
  )
}

function OperationsResults({
  loaderData,
  params,
  timeZone,
  initialRange,
}: Pick<Route.ComponentProps, "loaderData" | "params"> & {
  timeZone: string
  initialRange: PlantDateRange
}) {
  const [data, setData] = useState(loaderData.data)
  const [stacked, setStacked] = useState(true)
  const [selectedRange, setSelectedRange] = useState(initialRange)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>(
    () => ({
      from: calendarDate(initialRange.from),
      to: calendarDate(initialRange.to),
    })
  )

  const { devices, operations } = data
  const { from: dateFrom, to: dateTo } = selectedRange
  const handleQuery = async (range: DateRangeValue | undefined) => {
    setDateRange(range)
    if (!range?.from || !range?.to) return
    setError("")
    try {
      const nextRange = {
        from: range.from.toISOString().slice(0, 10),
        to: range.to.toISOString().slice(0, 10),
      }
      const query = new URLSearchParams(
        buildPlantDateRangeQuery(nextRange, timeZone)
      )
      const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/statistics?${query}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${loaderData.token}` },
      })
      if (!res.ok) throw new Error("Statistics request failed")
      const json = await res.json()
      if (json.operations?.query?.timeZone !== timeZone)
        throw new Error(
          "Statistics time zone does not match the plant configuration"
        )
      setData(json)
      setSelectedRange(nextRange)
    } catch (error) {
      setError(
        error instanceof RangeError
          ? m.history_date_range_invalid()
          : m.history_request_failed()
      )
    }
  }

  return (
    <>
      {error && <ErrorAlert title={m.operations_title()} description={error} />}
      <div className="mb-3 flex flex-col gap-3 xl:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.operations_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.operations_description({
                from: dateFrom,
                to: dateTo,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <DateRange
          dateRange={dateRange}
          setDateRange={handleQuery}
          timeZone="UTC"
          today={calendarDate(initialRange.to)}
        />
      </div>
      <div className="hidden xl:block">
        <Item className="mb-3" variant="outline">
          <ItemContent>
            <ItemTitle>{m.operations_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.operations_description({
                from: dateFrom,
                to: dateTo,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <DateRange
              dateRange={dateRange}
              setDateRange={handleQuery}
              timeZone="UTC"
              today={calendarDate(initialRange.to)}
            />
          </ItemActions>
        </Item>
      </div>
      <div className="grid gap-6 2xl:grid-cols-2">
        <CardWrapper
          title={m.operations_card_title()}
          // description={m.operations_card_description({ dateFrom, dateTo })}
          footer={
            <div className="flex w-full items-center justify-end gap-2">
              <Label htmlFor="stacked">Stacked</Label>
              <Switch
                id="stacked"
                checked={stacked}
                onCheckedChange={setStacked}
              />
            </div>
          }
        >
          <OperationsChart operations={operations.data} stacked={stacked} />
        </CardWrapper>
        {devices.data.length > 1 && (
          <CardWrapper
            title={m.operations_card_title_by_device()}
            // description={m.operations_card_description({ dateFrom, dateTo })}
            footer={
              <div className="flex w-full items-center justify-end gap-2">
                <Label htmlFor="stacked">Stacked</Label>
                <Switch
                  id="stacked"
                  checked={stacked}
                  onCheckedChange={setStacked}
                />
              </div>
            }
          >
            <OperationsChart operations={devices.data} stacked={stacked} />
          </CardWrapper>
        )}
      </div>
    </>
  )
}
