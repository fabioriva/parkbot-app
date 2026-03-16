import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useEffect, useState } from "react";
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
  const [data, setData] = useState(loaderData);
  const { count, dateFrom, dateTo, query } = data;
  console.log(data);
  // const { t } = useTranslation();

  return <h1>History</h1>;
}
