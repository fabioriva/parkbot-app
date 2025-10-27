import { lazy, Fragment, Suspense } from "react";
import { Error } from "~/components/error";
import { useData } from "~/lib/ws";
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
  if (!loaderData?.data) return <Error />;
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/map`;
  const { data } = useData(url, { initialData: loaderData?.data });
  const DynamicComponent = components[params.aps];
  return (
    <Fragment>
      <Suspense fallback={<span>Loading...</span>}>
        <DynamicComponent data={data} />
      </Suspense>
    </Fragment>
  );
}
