import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { Operations as Statistics } from "~/components/operations-chart";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/operations";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const from = format(
    subDays(startOfDay(new Date()), 14),
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
  const { devices, operations } = loaderData;
  // console.log(devices);
  const [dateFrom, dateTo] = devices.query.date.split(" ")
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
