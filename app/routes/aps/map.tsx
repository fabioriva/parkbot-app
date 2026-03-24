import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/map";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/map`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Map({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/map`;
  const { data } = useData(url, { initialData: loaderData });
  return (
    <></>
  );
}
