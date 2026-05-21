import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/dashboard";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/dashboard`;
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
  return <h1>Dashboard</h1>;
}
