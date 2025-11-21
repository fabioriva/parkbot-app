import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/history";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/dashboard`;
  const data = await fetcher(url);
  return { data };
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  // console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;
  return <h1>history</h1>;
}
