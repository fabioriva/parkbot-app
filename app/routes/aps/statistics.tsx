import { format, endOfDay, startOfDay, subDays } from "date-fns";
import * as React from "react";
import { Error } from "~/components/error";
import { StatisticsBarChart } from "~/components/statistics-bar-chart";

import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/statistics";

export async function loader({ params }: Route.LoaderArgs) {
  const from = format(
    subDays(startOfDay(new Date()), 7),
    "yyyy-MM-dd HH:mm:ss"
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const query = `dateFrom=${from}&dateTo=${to}`;
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/statistics?${query}`;
  const data = await fetcher(url);
  return { data };
}

export default function Statistics({
  loaderData,
  params,
}: Route.ComponentProps) {
  // console.log(loaderData);
  if (!loaderData?.data) return <Error />;

  const { devices, operations } = loaderData?.data;

  return (
    <React.Fragment>
      {
        <React.Fragment>
          {/* Mobile view */}
          <div className="block lg:hidden">
            <h1>Mobile view</h1>
          </div>
          {/* Desktop view */}
          <div className="hidden lg:block space-y-6">
            <StatisticsBarChart
              data={operations.data}
              date={operations.query.date}
            />
            <StatisticsBarChart data={devices.data} date={devices.query.date} />
          </div>
        </React.Fragment>
      }
    </React.Fragment>
  );
}
