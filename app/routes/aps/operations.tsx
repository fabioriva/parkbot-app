import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateRange } from "~/components/date-range";
import { Operations as Statistics } from "~/components/operations-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/operations";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const from = format(
    subDays(startOfDay(new Date()), 7),
    "yyyy-MM-dd HH:mm:ss",
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const query = `dateFrom=${from}&dateTo=${to}`;
  const url = `${process.env.BACKEND_URL}/${params?.aps}/statistics?${query}`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Operations({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const [data, setData] = useState(loaderData);
  const { devices, operations } = data;
  const [dateFrom, dateTo] = devices.query.date.split(" ");
  const handleQuery = async ({ from, to }) => {
    const strFrom = format(startOfDay(from), "yyyy-MM-dd HH:mm:ss");
    const strTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");
    const query = `dateFrom=${strFrom}&dateTo=${strTo}`;
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/statistics?${query}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  };
  return (
    <div className="flex flex-col flex-col-reverse gap-6 max-w-3xl">
      <DateRange
        from={dateFrom + " 00:00"}
        to={dateTo + " 00:00"}
        handleQuery={handleQuery}
      />
      <Statistics
        operations={devices.data}
        title="System operations grouped by device"
        description={`From ${dateFrom} to ${dateTo}`}
      />
      <Statistics
        operations={operations.data}
        title="System operations"
        description={`From ${dateFrom} to ${dateTo}`}
      />
    </div>
  );
}
