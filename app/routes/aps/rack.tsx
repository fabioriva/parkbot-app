import { lazy, Fragment, Suspense } from "react";
import { useSearchParams } from "react-router";
import { Error } from "~/components/error";
import { useData } from "~/lib/ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/rack";

const components = {
  et200m16: lazy(() => import("~/components/modules/et200-m-16")),
  et200m32: lazy(() => import("~/components/modules/et200-m-32")),
  // et200s16: lazy(() => import("@/components/ET200S16")),
  // et200s8: lazy(() => import("@/components/ET200S08")),
  // et200m08f: lazy(() => import("@/components/ET200M08_FS")),
  // et200m16f: lazy(() => import("@/components/ET200M16_FS")),
  // et200s8f: lazy(() => import("@/components/ET200S08_FS")),
};

export async function loader({ params }: Route.LoaderArgs) {
  const nr = Number(params?.nr) - 1;
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/racks/${nr}`;
  const data = await fetcher(url);
  return { data };
}

export default function Rack({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  // console.log(loaderData?.data);
  // query params
  const [searchParams] = useSearchParams();
  // ws
  const nr = Number(params?.nr) - 1;
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/racks/${nr}`;
  const { data } = useData(url, { initialData: loaderData?.data });
  // console.log(data);
  return (
    <Fragment>
      <h1>
        {searchParams.get("name")} Rack #{searchParams.get("nr")}
      </h1>
      <div
        className="overflow-scroll relative w-full h-96 flex items-center justify-center"
        id={`rack-${data.nr}`}
      >
        <h2>Simatic PLC Rack {data.nr}</h2>
        <Suspense fallback={<span>Loading...</span>}>
          {data.cards.map((item, key) => {
            const DynamicComponent = components[item.module];
            return (
              // <Fragment key={item.nr}>
              //   {DynamicComponent !== undefined && (
              //     <DynamicComponent key={key} module={item} />
              //   )}
              // </Fragment>
              <DynamicComponent module={item} key={key} />
            );
          })}
        </Suspense>
      </div>
    </Fragment>
  );
}
