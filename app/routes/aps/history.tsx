import { format, endOfDay, startOfDay, subDays } from "date-fns"
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
// import { DateRange } from "~/components/calendar"
import { Error as ErrorAlert } from "~/components/error-alert"
import { HistoryList } from "~/components/history-list"
import { HistoryQueryForm } from "~/components/history-query-form"
import { HistoryTable } from "~/components/history-table"
import { NoDataAlert } from "~/components/no-data-alert"
import { getToken } from "~/lib/cookie.server"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"

const LIMIT = 15

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const from = format(subDays(startOfDay(new Date()), 1), "yyyy-MM-dd HH:mm:ss")
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
  const query = `dateFrom=${from}&dateTo=${to}&card=0&device=0&stall=0`
  const url = `${process.env.BACKEND_URL}/${params?.aps}/history?${query}&page=${1}&limit=${LIMIT}`
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function History({ loaderData, params }) {
  if (!loaderData.data) return <NoDataAlert />
  const [hasMore, setHasMore] = useState(true)
  const [history, setHistory] = useState(loaderData.data)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  // console.log(history)

  const {
    card,
    // count,
    dateFrom,
    dateTo,
    device,
    devices,
    query,
    stall,
    total,
  } = history

  const handleQuery = async (card, dateRange, device, stall) => {
    setPage(1)
    const strFrom = format(startOfDay(dateRange.from), "yyyy-MM-dd HH:mm:ss")
    const strTo = format(endOfDay(dateRange.to), "yyyy-MM-dd HH:mm:ss")
    const query = `dateFrom=${strFrom}&dateTo=${strTo}&card=${card}&device=${device}&stall=${stall}&page=${1}&limit=${LIMIT}`
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    })
    if (res.ok) {
      const json = await res.json()
      setHistory(json)
    }
  }

  const fetchPage = async (pageNumber) => {
    const query = `dateFrom=${dateFrom}&dateTo=${dateTo}&card=${card}&device=${device}&stall=${stall}`
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}&page=${pageNumber}&limit=${LIMIT}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    })
    if (res.ok) {
      const json = await res.json()
      return json
    }
  }

  // useEffect(() => {
  //   fetchPage(1);
  // }, []);

  const loadMore = async () => {
    const next = page + 1
    setPage(next)
    const json = await fetchPage(next)
    setHistory((prev) => ({
      ...prev,
      // aggiorni metadati se servono
      count: json.count ?? prev.count,
      dateFrom: json.dateFrom ?? prev.dateFrom,
      dateTo: json.dateTo ?? prev.dateTo,
      // QUI: append invece di overwrite
      query: [...prev.query, ...json.query],
    }))
    setHasMore(json.hasMore)
  }

  const [rowsPerPage, setRowsPerPages] = useState(15)
  const pages = Math.ceil(total / rowsPerPage)
  const paginate = async (pageNumber) => {
    setPage(pageNumber)
    const json = await fetchPage(pageNumber)
    setHistory(json) // OK for Table!
  }
  const NoData = () => <ErrorAlert description="No record found." />
  return (
    <>
      <HistoryQueryForm
        dateFrom={dateFrom}
        dateTo={dateTo}
        devices={devices}
        handleQuery={handleQuery}
        open={open}
        setOpen={setOpen}
      />
      {/* List */}
      <div className="mb-3 flex flex-col gap-3 lg:hidden">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.history_title()}</ItemTitle>
            <ItemDescription>
              {m.history_description({
                from: dateFrom,
                to: dateTo,
                count: total,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        {/* <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} /> */}
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
                from: dateFrom,
                to: dateTo,
                count: total,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {/* <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} /> */}
            {/* <SearchInput
              search={search}
              placeholder={"Fuzzy search!"}
              handleSearch={handleSearch}
            /> */}
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
