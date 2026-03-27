import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/racks";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/racks`;
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
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const [data, setData] = useState(loaderData);

  return (
    <div>
      <h2>Data</h2>
      <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
