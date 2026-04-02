import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { DateRange } from "~/components/date-range";
import { HistoryList } from "~/components/history-list";
import { HistoryTable } from "~/components/history-table";
import { SearchInput } from "~/components/search-input";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
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
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const [history, setHistory] = useState(loaderData);
  const { count, dateFrom, dateTo, query } = history;
  const { t } = useTranslation();
  const handleQuery = async ({ from, to }) => {
    const strFrom = format(startOfDay(from), "yyyy-MM-dd HH:mm:ss");
    const strTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");
    const query = `system=0&dateFrom=${strFrom}&dateTo=${strTo}&filter=a&device=0&number=0`;
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`;
    const res = await fetch(url);
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
      keys: ["alarm.id", "card", "stall", "device.key"],
    });
    const result = fuse.search(e.target.value);
    setSearch(result);
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row justify-between gap-3">
        <DateRange from={dateFrom} to={dateTo} handleQuery={handleQuery} />
        <SearchInput
          search={search}
          placeholder={"Search by card, device or stall..."}
          handleSearch={handleSearch}
        />
      </div>
      <div className="block xl:hidden">
        <Item className="mb-3" variant="outline">
          <ItemContent>
            <ItemTitle>{t("history.title")}</ItemTitle>
            <ItemDescription>
              {t("history.description", {
                from: dateFrom,
                to: dateTo,
                count,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
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
