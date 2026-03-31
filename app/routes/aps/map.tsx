import { lazy, Fragment, Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Occupancy } from "~/components/occupancy-chart";
// import { ViewRadioGroup } from "~/components/map-view";
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
  const [tab, setTab] = useState("view2");
  const onTabChange = (value) => {
    setTab(value);
  };
  const DynamicComponent = components[params.aps];

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList className="grid w-sm grid-cols-4">
        <TabsTrigger value="view1">Cards</TabsTrigger>
        <TabsTrigger value="view2">Slots</TabsTrigger>
        <TabsTrigger value="view3">Sizes</TabsTrigger>
        <TabsTrigger value="view4">Stats</TabsTrigger>
      </TabsList>
      {tab !== "view4" ? (
        <TabsContent value={tab}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center">Loading...</div>
            }
          >
            <DynamicComponent data={data} view={tab} />
          </Suspense>
        </TabsContent>
      ) : (
        <Occupancy occupancy={data.occupancy} />
      )}
    </Tabs>
  );
}
