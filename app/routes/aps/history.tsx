import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { HistoryList } from "~/components/history-list";
import { HistoryQuery } from "~/components/history-query";
import { HistoryTable } from "~/components/history-table";
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
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData) return <h1>No data available</h1>;
  const [history, setHistory] = useState(loaderData);
  const { count, dateFrom, dateTo, query } = history;
  // console.log(history);
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
  return (
    <>
      <div className="block lg:hidden">
        <div className="flex flex-col gap-3 mb-3">
          <h1 className="text-lg">{t("history.title")}</h1>
          <HistoryQuery from={dateFrom} to={dateTo} handleQuery={handleQuery} />
        </div>
        <HistoryList history={query} />
      </div>
      <div className="hidden lg:block">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{t("history.title")}</ItemTitle>
            <ItemDescription>
              {t("history.description", { from: dateFrom, to: dateTo, count })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <HistoryQuery
              from={dateFrom}
              to={dateTo}
              handleQuery={handleQuery}
            />
          </ItemActions>
          <HistoryTable history={history} />
        </Item>
      </div>
    </>
  );
}
