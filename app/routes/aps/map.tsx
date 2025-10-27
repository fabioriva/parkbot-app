import { lazy, Fragment, Suspense } from "react";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/map";

const components = {
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  menloa: lazy(() => import("~/components/maps/menloa")),
  menlob: lazy(() => import("~/components/maps/menlob")),
  wallstreet: lazy(() => import("~/components/maps/wallstreet")),
};

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/map`;
  const data = await fetcher(url);
  return { data };
}

export default function Map({ loaderData, params }: Route.ComponentProps) {
  // console.log(params);
  const DynamicComponent = components[params.aps];
  return (
    <Fragment>
      <h1>Map</h1>
      <Suspense fallback={<span>Loading...</span>}>
        <DynamicComponent />
      </Suspense>
    </Fragment>
  );
}
