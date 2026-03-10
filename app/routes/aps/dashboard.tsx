import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/dashboard";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  return await fetcher(url);
}

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  // console.log(loaderData);
  if (!loaderData) return <h1>No data available</h1>;
  const [data, setData] = useState(loaderData);
  const fetcher = useFetcher();
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/aps/${params.aps}/dashboard`);
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetcher]);
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);
  const { activity, exitQueue, occupancy, operations, system } = data;
  const [busy, free, lock] = occupancy;
  const { t } = useTranslation();

  return <h1>Dashboard</h1>;
}
