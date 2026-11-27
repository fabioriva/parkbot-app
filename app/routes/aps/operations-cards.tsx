import { useState } from "react"
import {
  data,
  Form,
  Link,
  redirect,
  useNavigation,
  useSearchParams,
} from "react-router"
import type { DateRange as DateRangeValue } from "react-day-picker"
import { CardMovementsChart } from "~/components/card-movements-chart"
import { CardWrapper } from "~/components/card-wrapper"
import { DateRange } from "~/components/date-range"
import { Error as ErrorAlert } from "~/components/error-alert"
import { Operations as OperationsChart } from "~/components/operations-chart"
import { OperationsNavigation } from "~/components/operations-navigation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { requireAps } from "~/lib/authorization.server"
import {
  buildCardUsageSeries,
  type CardMovementDay,
  type CardMovementTotal,
} from "~/lib/card-usage-chart"
import { getToken } from "~/lib/cookie.server"
import {
  buildPlantDateRangeQuery,
  calendarDate,
  formatPlantDateTime,
  getDefaultPlantDateRange,
  isValidTimeZone,
  plantDateRangeFromSearch,
  type PlantDateRange,
} from "~/lib/date-time"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"
import type { Route } from "./+types/operations-cards"

interface CardStatistics {
  rows: {
    card: number
    entries: number
    exits: number
    activeDays: number
    lastMovement: string
    daily?: CardMovementDay[]
  }[]
  summary: { activeCards: number; entries: number; exits: number }
  topCards?: CardMovementTotal[]
  page: number
  pageSize: number
  query: { timeZone: string }
}

const sortColumns = [
  "card",
  "entries",
  "exits",
  "activeDays",
  "lastMovement",
] as const
const defaultSort = "-entries"

function positiveParameter(search: URLSearchParams, key: string) {
  const values = search.getAll(key)
  if (!values.length) return undefined
  const number = Number(values[0])
  if (
    values.length !== 1 ||
    !/^\d+$/.test(values[0]) ||
    !Number.isSafeInteger(number) ||
    number < 1
  )
    throw data(m.operations_cards_invalid_filter(), { status: 400 })
  return number
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await requireAps(request, params.aps, "read")
  const timeZone = session.aps?.timeZone
  if (!isValidTimeZone(timeZone)) return { timeZone: null }

  const search = new URL(request.url).searchParams
  const card = positiveParameter(search, "card")
  const page = card === undefined ? (positiveParameter(search, "page") ?? 1) : 1
  const orders = search.getAll("sort")
  const sort = orders[0] ?? defaultSort
  if (
    orders.length > 1 ||
    !sortColumns.some((column) => sort === column || sort === `-${column}`)
  )
    throw data(m.operations_cards_invalid_filter(), { status: 400 })
  const defaultRange = getDefaultPlantDateRange(timeZone, 7)
  let range: PlantDateRange
  let query: URLSearchParams
  try {
    range = plantDateRangeFromSearch(search, defaultRange)
    query = new URLSearchParams(buildPlantDateRangeQuery(range, timeZone))
  } catch (error) {
    if (!(error instanceof RangeError)) throw error
    throw data(m.history_date_range_invalid(), { status: 400 })
  }
  query.set("page", String(page))
  query.set("sort", sort)
  if (card !== undefined) query.set("card", String(card))
  const statistics: CardStatistics = await fetcher(
    `${process.env.BACKEND_URL}/${encodeURIComponent(params.aps)}/statistics/cards?${query}`,
    {
      headers: { Authorization: `Bearer ${getToken(request)}` },
      signal: request.signal,
    }
  )
  if (statistics.query.timeZone !== timeZone)
    throw data(m.operations_cards_time_zone_mismatch(), { status: 502 })
  const pages = Math.max(
    1,
    Math.ceil(statistics.summary.activeCards / statistics.pageSize)
  )
  if (page > pages)
    throw redirect(
      `?${new URLSearchParams({ ...range, sort, page: String(pages) })}`
    )
  return {
    statistics,
    range,
    timeZone,
    card,
    pages,
    sort,
    today: defaultRange.to,
  }
}

function CardStatisticsDateRange({
  range,
  today,
  onChange,
}: {
  range: PlantDateRange
  today: string
  onChange: (range: PlantDateRange) => void
}) {
  const [selection, setSelection] = useState<DateRangeValue | undefined>(
    () => ({
      from: calendarDate(range.from),
      to: calendarDate(range.to),
    })
  )

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="card-statistics-period">{m.operations_period()}</Label>
      <DateRange
        id="card-statistics-period"
        dateRange={selection}
        setDateRange={(next) => {
          setSelection(next)
          if (next?.from && next.to)
            onChange({
              from: next.from.toISOString().slice(0, 10),
              to: next.to.toISOString().slice(0, 10),
            })
        }}
        timeZone="UTC"
        today={calendarDate(today)}
      />
    </div>
  )
}

export default function OperationsCards({
  loaderData,
  params,
}: Route.ComponentProps) {
  const [, setSearch] = useSearchParams()
  const navigation = useNavigation()
  const { timeZone, statistics, range, card, pages, sort, today } = loaderData
  if (!timeZone)
    return (
      <>
        <OperationsNavigation aps={params.aps} view="cards" />
        <ErrorAlert
          title={m.aps_field_time_zone()}
          description={m.aps_time_zone_missing()}
        />
      </>
    )

  const { rows, summary, page, topCards } = statistics
  const totalMovements = summary.entries + summary.exits
  const hasDistribution = totalMovements > 0 && Boolean(topCards?.length)
  const detail = card === undefined ? undefined : rows[0]
  const chart = detail?.daily
    ? buildCardUsageSeries(range, detail.daily)
    : undefined
  const tickDate = new Intl.DateTimeFormat(getLocale(), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
  const listSearch = { ...range, sort }
  const numberFormat = new Intl.NumberFormat(getLocale())
  const stats = [
    { label: m.operations_cards_active(), value: summary.activeCards },
    { label: m.operations_entries(), value: summary.entries },
    { label: m.operations_exits(), value: summary.exits },
  ]
  const cardSearch = (number: number) =>
    new URLSearchParams({ ...listSearch, card: String(number) })
  const pageSearch = (number: number) =>
    new URLSearchParams({ ...listSearch, page: String(number) })
  const historyPath = `/aps/${encodeURIComponent(params.aps)}/history`
  const columnLabels = {
    card: m.history_table_head_card(),
    entries: m.operations_entries(),
    exits: m.operations_exits(),
    activeDays: m.operations_cards_active_days(),
    lastMovement: m.operations_cards_last_movement(),
  }

  return (
    <>
      <OperationsNavigation aps={params.aps} range={range} view="cards" />
      <section
        className="flex flex-col gap-3"
        aria-busy={navigation.state !== "idle"}
      >
        <div className="flex flex-wrap items-end gap-3">
          <CardStatisticsDateRange
            key={`${range.from}:${range.to}`}
            range={range}
            today={today}
            onChange={(nextRange) => {
              const search = new URLSearchParams({ ...nextRange, sort })
              if (card !== undefined) search.set("card", String(card))
              setSearch(search)
            }}
          />
          <Form
            method="get"
            key={card ?? "all"}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="from" value={range.from} />
            <input type="hidden" name="to" value={range.to} />
            <input type="hidden" name="sort" value={sort} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-statistics-number">
                {m.history_table_head_card()}
              </Label>
              <Input
                id="card-statistics-number"
                name="card"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*[1-9][0-9]*"
                required
                defaultValue={card}
                className="w-32"
              />
            </div>
            <Button type="submit" variant="outline">
              {m.operations_cards_search()}
            </Button>
            {card !== undefined && (
              <Button
                variant="ghost"
                nativeButton={false}
                render={
                  <Link
                    to={{ search: `?${new URLSearchParams(listSearch)}` }}
                  />
                }
              >
                {m.operations_cards_show_all()}
              </Button>
            )}
          </Form>
        </div>
        <p className="text-sm text-muted-foreground">
          {m.aps_field_time_zone()} {timeZone}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map(({ label, value }) => (
            <CardWrapper
              key={label}
              className="[&>[data-slot=card-content]]:grow max-sm:[&>[data-slot=card-content]]:px-2"
            >
              <dl className="flex h-full flex-col justify-between gap-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-2xl font-semibold break-all tabular-nums">
                  {numberFormat.format(value)}
                </dd>
              </dl>
            </CardWrapper>
          ))}
        </div>
        {card === undefined && (
          <CardWrapper
            title={m.operations_cards_distribution()}
            description={
              hasDistribution
                ? m.operations_cards_distribution_description()
                : undefined
            }
          >
            {hasDistribution && topCards ? (
              <CardMovementsChart
                topCards={topCards}
                total={totalMovements}
                cardLink={(number) => `?${cardSearch(number)}`}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {totalMovements === 0
                  ? m.operations_cards_distribution_empty()
                  : m.operations_cards_distribution_unavailable()}
              </p>
            )}
          </CardWrapper>
        )}
        {rows.length ? (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortColumns.map((column) => {
                    const currentOrder =
                      sort === column
                        ? "ascending"
                        : sort === `-${column}`
                          ? "descending"
                          : undefined
                    const nextSort =
                      currentOrder === "descending" ||
                      (!currentOrder && column === "card")
                        ? column
                        : `-${column}`
                    const alignRight =
                      column !== "card" && column !== "lastMovement"
                    return (
                      <TableHead
                        key={column}
                        scope="col"
                        aria-sort={
                          card === undefined ? currentOrder : undefined
                        }
                        className={alignRight ? "text-right" : undefined}
                      >
                        {card === undefined ? (
                          <Link
                            className="hover:underline"
                            to={{
                              search: `?${new URLSearchParams({ ...range, sort: nextSort })}`,
                            }}
                          >
                            {columnLabels[column]}
                            {currentOrder && (
                              <span aria-hidden="true">
                                {currentOrder === "ascending" ? " ↑" : " ↓"}
                              </span>
                            )}
                          </Link>
                        ) : (
                          columnLabels[column]
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.card}>
                    <TableCell>
                      {detail ? (
                        row.card
                      ) : (
                        <Link
                          className="font-medium underline underline-offset-4"
                          to={{ search: `?${cardSearch(row.card)}` }}
                          aria-label={m.operations_cards_detail({
                            card: row.card,
                          })}
                        >
                          {row.card}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numberFormat.format(row.entries)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numberFormat.format(row.exits)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numberFormat.format(row.activeDays)}
                    </TableCell>
                    <TableCell>
                      <time dateTime={row.lastMovement}>
                        {formatPlantDateTime(
                          row.lastMovement,
                          timeZone,
                          "dd/MM/yyyy HH:mm:ss xxx"
                        )}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="rounded-xl border p-4 text-sm text-muted-foreground">
            {m.operations_cards_empty()}
          </p>
        )}
        {pages > 1 && (
          <nav
            aria-label={m.operations_cards_tab()}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {page > 1 && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to={{ search: `?${pageSearch(page - 1)}` }} />}
              >
                {m.history_pagination_previous()}
              </Button>
            )}
            <span className="px-2 text-sm tabular-nums">
              {m.operations_cards_page({ page, pages })}
            </span>
            {page < pages && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to={{ search: `?${pageSearch(page + 1)}` }} />}
              >
                {m.history_pagination_next()}
              </Button>
            )}
          </nav>
        )}
        {detail && chart && (
          <CardWrapper
            title={m.operations_cards_detail({ card: detail.card })}
            description={
              chart.weekly
                ? m.operations_cards_weekly()
                : m.operations_cards_daily()
            }
            footer={
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    to={{
                      pathname: historyPath,
                      search: `?${new URLSearchParams({ ...range, card: String(detail.card) })}`,
                    }}
                  />
                }
              >
                {m.operations_cards_open_history()}
              </Button>
            }
          >
            <OperationsChart
              operations={chart.series}
              showTooltipLabel
              formatTick={(value) =>
                tickDate.format(calendarDate(String(value).slice(0, 10)))
              }
            />
          </CardWrapper>
        )}
      </section>
    </>
  )
}
