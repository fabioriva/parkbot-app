import { format, endOfDay, startOfDay, subDays } from "date-fns";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "~/hooks/use-mobile";
import { HistoryList } from "~/components/history-list";
import { HistoryQuery } from "~/components/history-query";
import { HistoryTable } from "~/components/history-table";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/history";

export async function loader({ params }: Route.LoaderArgs) {
  const from = format(
    subDays(startOfDay(new Date()), 1),
    "yyyy-MM-dd HH:mm:ss"
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const filter = "a";
  const query = `system=0&dateFrom=${from}&dateTo=${to}&filter=${filter}&device=0&number=0`;
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`;
  const data = await fetcher(url);
  return { data };
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  // console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;

  const [history, setHistory] = useState(loaderData?.data);
  const { count, dateFrom, dateTo, query } = history;
  const isMobile = useIsMobile();
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
    <React.Fragment>
      {isMobile ? (
        <React.Fragment>
          <div className="flex flex-col gap-3">
            <h1 className="text-lg">{t("aps.history.title")}</h1>
            <HistoryQuery
              from={dateFrom}
              to={dateTo}
              handleQuery={handleQuery}
            />
          </div>
          <HistoryList history={query} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="flex items-center">
            <h1 className="grow text-lg">{t("aps.history.title")}</h1>
            <HistoryQuery
              from={dateFrom}
              to={dateTo}
              handleQuery={handleQuery}
            />
          </div>
          <HistoryTable history={history} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
