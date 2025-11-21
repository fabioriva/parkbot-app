import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useIsMobile } from "~/hooks/use-mobile";
import { HistoryList } from "~/components/history-list";
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
  console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;

  const { count, query } = loaderData?.data;
  console.log(query);
  const isMobile = useIsMobile();
  return <div>{isMobile ? <h1>mobile</h1> : <h1>desktop</h1>}</div>;
}
