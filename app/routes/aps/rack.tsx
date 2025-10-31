import { useSearchParams } from "react-router";
import { Error } from "~/components/error";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/rack";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/racks/${params?.nr}`;
  const data = await fetcher(url);
  console.log(data);
  return { data };
}

export default function Rack({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  console.log(loaderData?.data);
  const data = loaderData?.data;
  // query params
  const [searchParams] = useSearchParams();
  return (
    <div className="flex flex-wrap gap-3">
      Rack {searchParams.get("name")} {searchParams.get("nr")}
    </div>
  );
}
