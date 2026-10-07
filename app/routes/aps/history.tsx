import { data as routeData, redirect } from "react-router"
import { Search } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import InfiniteScroll from "react-infinite-scroll-component"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { Error as ErrorAlert } from "~/components/error-alert"
import { HistoryList } from "~/components/history-list"
import { HistoryQueryForm } from "~/components/history-query-form"
import { HistoryTable } from "~/components/history-table"
import { NoDataAlert } from "~/components/no-data-alert"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import {
  buildPlantDateRangeQuery,
  getDefaultPlantDateRange,
  isValidTimeZone,
  type PlantDateRange,
} from "~/lib/date-time"
import { auth } from "~/lib/auth.server"
import type { Route } from "./+types/history"
import { m } from "@paraglide/messages.js"

export interface HistoryEntry {
  date: string
  device: { id: number; key: string }
  mode: { id: number; key: string }
  operation: { id: number; key: string }
  alarm?: {
    id: number
    key: string
    query?: Record<string, unknown>
  }
  card: number
  stall: number
  size: number
  user?: string | null
}

const LIMIT = 15

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return redirect("/signin")
  if (!("aps" in session.user) || session.user.aps !== params.aps)
    throw routeData("Forbidden", { status: 403 })
  const token = getToken(request)
  const timeZone = session.aps?.timeZone
  if (!isValidTimeZone(timeZone)) {
    return { data: null, token, timeZone: null, range: null, parameters: null }
  }
  const range = getDefaultPlantDateRange(timeZone)
  const parameters = {
    ...buildPlantDateRangeQuery(range, timeZone),
    card: 0,
    device: 0,
    stall: 0,
  }
  const query = historySearchParams(parameters, 1)
  const url = `${process.env.BACKEND_URL}/${params.aps}/history?${query}`
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token, timeZone, range, parameters }
}

type HistoryParameters = {
  dateFrom: string
  dateTo: string
  card: number
  device: number
  stall: number
}

function historySearchParams(parameters: HistoryParameters, page: number) {
  return new URLSearchParams(
    Object.entries({ ...parameters, page, limit: LIMIT }).map(
      ([key, value]) => [key, String(value)]
    )
  )
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.timeZone || !loaderData.range || !loaderData.parameters)
    return (
      <ErrorAlert
        title={m.aps_field_time_zone()}
        description={m.aps_time_zone_missing()}
      />
    )
  if (!loaderData.data) return <NoDataAlert />
  return (
    <HistoryResults
      key={`${params.aps}:${loaderData.timeZone}:${loaderData.parameters.dateFrom}:${loaderData.parameters.dateTo}`}
      loaderData={loaderData}
      params={params}
      timeZone={loaderData.timeZone}
      initialRange={loaderData.range}
      initialParameters={loaderData.parameters}
    />
  )
}

function HistoryResults({
  loaderData,
  params,
  timeZone,
  initialRange,
  initialParameters,
}: Pick<Route.ComponentProps, "loaderData" | "params"> & {
  timeZone: string
  initialRange: PlantDateRange
  initialParameters: HistoryParameters
}) {
  const [hasMore, setHasMore] = useState(loaderData.data.hasMore)
  const [history, setHistory] = useState(loaderData.data)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [parameters, setParameters] = useState(initialParameters)
  const [selectedRange, setSelectedRange] = useState(initialRange)
  const [error, setError] = useState("")

  const { devices, query, total } = history

  const handleQuery = async (
    card: number,
    range: PlantDateRange,
    device: number,
    stall: number
  ) => {
    const nextParameters = {
      ...buildPlantDateRangeQuery(range, timeZone),
      card,
      device,
      stall,
    }
    const query = historySearchParams(nextParameters, 1)
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    })
    if (res.ok) {
      const json = await res.json()
      setHistory(json)
      setPage(1)
      setHasMore(json.hasMore)
      setParameters(nextParameters)
      setSelectedRange(range)
      setError("")
    } else {
      throw new Error("History request failed")
    }
  }

  const fetchPage = async (pageNumber: number) => {
    const query = historySearchParams(parameters, pageNumber)
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    })
    if (res.ok) {
      const json = await res.json()
      return json
    }
    throw new Error("History request failed")
  }

  // useEffect(() => {
  //   fetchPage(1);
  // }, []);

  const loadMore = async () => {
    const next = page + 1
    try {
      const json = await fetchPage(next)
      setPage(next)
      setHistory((prev: typeof history) => ({
        ...prev,
        query: [...prev.query, ...json.query],
      }))
      setHasMore(json.hasMore)
      setError("")
    } catch {
      setError(m.history_request_failed())
    }
  }

  const pages = Math.ceil(total / LIMIT)
  const paginate = async (pageNumber: number) => {
    try {
      const json = await fetchPage(pageNumber)
      setPage(pageNumber)
      setHistory(json)
      setHasMore(json.hasMore)
      setError("")
    } catch {
      setError(m.history_request_failed())
    }
  }

  const NoData = () => <ErrorAlert title="" description="No record found." />
  return (
    <>
      {error && <ErrorAlert title="" description={error} />}
      <p className="mb-3 text-sm text-muted-foreground">
        {m.aps_field_time_zone()}: {timeZone}
      </p>
      {open && (
        <HistoryQueryForm
          devices={devices}
          handleQuery={handleQuery}
          open={open}
          setOpen={setOpen}
          timeZone={timeZone}
          initialRange={selectedRange}
          today={initialRange.to}
          initialFilters={parameters}
        />
      )}
      {/* List */}
      <div className="mb-3 flex flex-col gap-3 lg:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.history_title()}</ItemTitle>
            <ItemDescription>
              {m.history_description({
                from: selectedRange.from,
                to: selectedRange.to,
                count: total,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <Button onClick={() => setOpen(true)} variant="outline">
          <Search data-icon="inline-start" /> Search
        </Button>
        {query.length > 0 ? (
          <InfiniteScroll
            dataLength={query.length}
            next={loadMore}
            hasMore={hasMore}
            loader={<p className="pt-6">Loading more records…</p>}
            endMessage={<p className="pt-6">All records loaded.</p>}
          >
            <HistoryList media={true} query={query} />
          </InfiniteScroll>
        ) : (
          <NoData />
        )}
      </div>
      {/* Table */}
      <div className="hidden max-w-6xl lg:block">
        <Item className="mb-3" variant="outline">
          <ItemContent>
            <ItemTitle>{m.history_title()}</ItemTitle>
            <ItemDescription>
              {m.history_description({
                from: selectedRange.from,
                to: selectedRange.to,
                count: total,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={() => setOpen(true)} variant="outline">
              <Search data-icon="inline-start" /> Search
            </Button>
          </ItemActions>
        </Item>
        {query.length > 0 ? (
          <HistoryTable
            currentPage={page}
            pages={pages}
            paginate={paginate}
            query={query}
            rowsPerPage={LIMIT}
          />
        ) : (
          <NoData />
        )}
      </div>
    </>
  )
}
