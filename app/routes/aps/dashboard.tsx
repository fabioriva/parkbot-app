import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Dashboard({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData) return <h1 className="text-lg dark:text-red-500 font-semibold">Data not available!</h1>;
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
  // console.log(data);
  // const { activity, exitQueue, occupancy, operations, system } = data;
  // const [busy, free, lock] = occupancy;
  // const { t } = useTranslation();

  return <></>;
}
