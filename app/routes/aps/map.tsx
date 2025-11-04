import { lazy, Fragment, Suspense, useState } from "react";
import { Error } from "~/components/error";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useData } from "~/lib/ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/map";

const components = {
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  daman: lazy(() => import("~/components/maps/daman")),
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
  const [view, setView] = useState("view-2");
  const DynamicComponent = components[params.aps];
  return (
    <Fragment>
      <div className="flex justify-start gap-3 py-1.5">
        <span>Select a view:</span>
        <RadioGroup
          className="grid-flow-col"
          orientation="horizontal"
          value={view}
          onValueChange={(value) => setView(value)}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-1" id="r1" />
            <Label htmlFor="r1">Card</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-2" id="r2" />
            <Label htmlFor="r2">Stall</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-3" id="r3" />
            <Label htmlFor="r3">Size</Label>
          </div>
        </RadioGroup>
      </div>
      <Suspense fallback={<span>Loading...</span>}>
        <DynamicComponent data={data} view={view} />
      </Suspense>
    </Fragment>
  );
}
