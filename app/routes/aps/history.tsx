import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { DateRange } from "~/components/date-range";
import { HistoryList } from "~/components/history-list";
import { HistorySearch } from "~/components/history-search";
import { HistoryTable } from "~/components/history-table";
import { NoDataAlert } from "~/components/no-data-alert";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/history";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
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

export default function History({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;
  const [history, setHistory] = useState(loaderData.data);
  const { count, dateFrom, dateTo, query } = history;
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
  // Fuzzy search
  const [search, setSearch] = useState([]);
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const Fuse = (await import("fuse.js")).default;
    const fuse = new Fuse(query, {
      keys: ["alarm.id", "card", "device.key", "operation.key", "stall"],
    });
    const result = fuse.search(e.target.value);
    setSearch(result);
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-3 xl:hidden ">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.history_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.history_description({
                from: dateFrom,
                to: dateTo,
                count,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} />
        <HistorySearch
          search={search}
          placeholder={"Fuzzy search!"}
          handleSearch={handleSearch}
        />
        {search.length > 0 ? (
          <HistoryList
            query={search.map((obj) => obj["item"]).flat()}
            media={true}
          />
        ) : (
          <HistoryList query={query} media={true} />
        )}
      </div>
      <div className="hidden xl:block">
        <Item className="mb-3" variant="outline">
          <ItemContent>
            <ItemTitle>{m.history_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.history_description({
                from: dateFrom,
                to: dateTo,
                count,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} />
            <HistorySearch
              search={search}
              placeholder={"Fuzzy search!"}
              handleSearch={handleSearch}
            />
          </ItemActions>
        </Item>
        {search.length > 0 ? (
          <HistoryTable
            history={history}
            query={search.map((obj) => obj["item"]).flat()}
          />
        ) : (
          <HistoryTable history={history} query={query} />
        )}
      </div>
    </>
  );
}
