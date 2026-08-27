import { format, endOfDay, startOfDay, subDays } from "date-fns"
import { Search } from "lucide-react"
import { useState } from "react"
import { useFetcher } from "react-router"
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
  const filter = "a"
  const query = `system=0&dateFrom=${from}&dateTo=${to}&filter=${filter}&device=0&number=0`
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
  const fetcher = useFetcher()

  const [hasMore, setHasMore] = useState(true)
  const [history, setHistory] = useState(loaderData.data)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { count, dateFrom, dateTo, query, total } = history

  const handleQuery = async ({ from, to }) => {
    const strFrom = format(startOfDay(from), "yyyy-MM-dd HH:mm:ss")
    const strTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss")
    const query = `system=0&dateFrom=${strFrom}&dateTo=${strTo}&filter=a&device=0&number=0&page=${1}&limit=${LIMIT}`
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

  const handleSearch = async (card, dateRange, stall) => {
    console.log(card, dateRange, stall)
    handleQuery(dateRange)
  }

  const fetchPage = async (pageNumber) => {
    const query = `system=0&dateFrom=${dateFrom}&dateTo=${dateTo}&filter=a&device=0&number=0`
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}&page=${pageNumber}&limit=${LIMIT}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    })
    if (res.ok) {
      const json = await res.json()
      // console.log(pageNumber, "Data json:", json);
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
    // console.log(pageNumber)
    setPage(pageNumber)
    const json = await fetchPage(pageNumber)
    setHistory(json) // OK for Table!
  }

  return (
    <>
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
        <InfiniteScroll
          dataLength={query.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<p className="pt-6">Loading more records…</p>}
          endMessage={<p className="pt-6">All records loaded.</p>}
        >
          <HistoryList media={true} query={query} />
        </InfiniteScroll>
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
        <HistoryTable
          currentPage={page}
          pages={pages}
          paginate={paginate}
          query={query}
          rowsPerPage={LIMIT}
        />
      </div>
      <HistoryQueryForm
        // action="create"
        // fetcher={fetcher}
        dateFrom={dateFrom}
        dateTo={dateTo}
        handleSearch={handleSearch}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}
