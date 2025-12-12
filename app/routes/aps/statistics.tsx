import { format, endOfDay, startOfDay, subDays } from "date-fns";
import React, { useState } from "react";
import { Error } from "~/components/error";

import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/statistics";

export async function loader({ params }: Route.LoaderArgs) {
  const from = format(
    subDays(startOfDay(new Date()), 1),
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
  console.log(loaderData);
  if (!loaderData?.data) return <Error />;

  return <h1>Statistics</h1>;
}
