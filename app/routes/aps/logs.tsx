import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { DateRange } from "~/components/date-range";
import { NoDataAlert } from "~/components/no-data-alert";
import { OperationsAvatar } from "~/components/operation-avatar";
import { getToken } from "~/lib/cookie.server";
import { logT, safeMessageT } from "~/lib/trans";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request);
  const from = format(
    subDays(startOfDay(new Date()), 1),
    "yyyy-MM-dd HH:mm:ss",
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const filter = "a";
  const query = `system=0&dateFrom=${from}&dateTo=${to}&filter=${filter}&device=0&number=0`;
  const url = `${process.env.BACKEND_URL}/${params?.aps}/history?${query}`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Logs({ loaderData, params }) {
  if (!loaderData.data) return <NoDataAlert />;
  const [history, setHistory] = useState(loaderData.data);
  const { count, dateFrom, dateTo, query, total } = history;
  const handleQuery = async ({ from, to }) => {
    const strFrom = format(startOfDay(from), "yyyy-MM-dd HH:mm:ss");
    const strTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");
    const query = `system=0&dateFrom=${strFrom}&dateTo=${strTo}&filter=a&device=0&number=0`;
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      setHistory(json);
    }
  };

  const limit = 25;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = async (pageNumber) => {
    const query = `system=0&dateFrom=${dateFrom}&dateTo=${dateTo}&filter=a&device=0&number=0`;
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}&page=${pageNumber}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      console.log(pageNumber, "Data:", json);
      // setHistory(json);
      setHistory((prev) => ({
        ...prev,
        // aggiorni metadati se servono
        count: json.count ?? prev.count,
        dateFrom: json.dateFrom ?? prev.dateFrom,
        dateTo: json.dateTo ?? prev.dateTo,
        // QUI: append invece di overwrite
        query: [...prev.query, ...json.query],
      }));
      setHasMore(json.hasMore);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  };

  // return (
  //   <>
  //     <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} />
  //     <pre className="text-xs">{JSON.stringify(query, null, 2)}</pre>
  //     <Button
  //       className=""
  //       variant="outline"
  //       disabled={!hasMore}
  //       onClick={loadMore}
  //     >
  //       Load more
  //     </Button>
  //   </>
  // );

  return (
    <div className="flex flex-col gap-3 mb-3 xl:hidden ">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{m.history_title()}</ItemTitle>
          <ItemDescription className="text-xs">
            {m.history_description({
              from: dateFrom,
              to: dateTo,
              count: total,
            })}
          </ItemDescription>
        </ItemContent>
      </Item>
      <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} />
      <InfiniteScroll
        dataLength={query.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<p className="pt-6">Loading more records…</p>}
        endMessage={<p className="pt-6">All records loaded.</p>}
      >
        <ItemGroup className="gap-0">
          {query.map((item, key) => (
            <Item className="px-0 py-1.5 gap-3" key={key}>
              {/* {media && ( */}
              <ItemMedia>
                <OperationsAvatar
                  device={item.device}
                  operation={item.operation}
                />
              </ItemMedia>
              {/* )} */}
              <ItemContent className="gap-0.5">
                <ItemTitle className="line-clamp-1">
                  {item.device.id === 0 && !item.user
                    ? m.operator()
                    : item.user}
                  {item.device.id !== 0 && item.device.key}
                  {item.device.id !== 0 && (
                    <span className="text-normal">
                      {" "}
                      {safeMessageT("mode", item.mode.key)}
                    </span>
                  )}
                </ItemTitle>
                <ItemDescription className="flex items-center gap-3">
                  <span>{logT(item)}</span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <div className="flex flex-col text-right">
                  <span>{item.date.slice(0, 10)}</span>
                  <span>{item.date.slice(11, 19)}</span>
                </div>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </InfiniteScroll>
    </div>
  );
}
