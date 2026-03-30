import { lazy, Fragment, Suspense, useState } from "react";
// import { Occupancy } from "~/components/occupancy-chart";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/map";

const components = {
  // bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  "daman-n": lazy(() => import("~/components/maps/daman-n")),
  // menloa: lazy(() => import("~/components/maps/menloa")),
  // menlob: lazy(() => import("~/components/maps/menlob")),
  // wallstreet: lazy(() => import("~/components/maps/wallstreet")),
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/map`;
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
  const [view, setView] = useState("view-2");
  const DynamicComponent = components[params.aps];
  return (
    <Fragment>
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <DynamicComponent data={data} view={view} />
      </Suspense>
    </Fragment>
  );
}
