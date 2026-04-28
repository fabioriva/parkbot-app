import { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { EditStallDialogProvider } from "~/components/edit-stall-dialog";
import { Occupancy } from "~/components/occupancy-chart";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/map";

const components = {
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  "daman-n": lazy(() => import("~/components/maps/daman-n")),
  menloa: lazy(() => import("~/components/maps/menlo-a")),
  menlob: lazy(() => import("~/components/maps/menlo-b")),
  wallstreet: lazy(() => import("~/components/maps/spire")),
  washingtonblvd: lazy(() => import("~/components/maps/8888")),
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
  // const [tab, setTab] = useState("view2");
  // const onTabChange = (value) => {
  //   setTab(value);
  // };
  const DynamicComponent = components[params.aps];

  return (
    <Tabs defaultValue="map">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="map">Map</TabsTrigger>
        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
      </TabsList>
      <TabsContent value="map">
        <Suspense fallback={<p className="py-3">Loading...</p>}>
          <EditStallDialogProvider>
            <DynamicComponent data={data} />
          </EditStallDialogProvider>
        </Suspense>
      </TabsContent>
      <TabsContent value="occupancy" className="max-w-xl">
        <Occupancy occupancy={data.occupancy} />
      </TabsContent>
    </Tabs>
  );

//   return (
//     <Tabs value={tab} onValueChange={onTabChange}>
//       <TabsList>
//         <TabsTrigger value="view0">Icons</TabsTrigger>
//         <TabsTrigger value="view1">Cards</TabsTrigger>
//         <TabsTrigger value="view2">Slots</TabsTrigger>
//         <TabsTrigger value="view3">Sizes</TabsTrigger>
//         <TabsTrigger value="view4">Occupancy</TabsTrigger>
//       </TabsList>
//       {tab !== "view4" ? (
//         <TabsContent value={tab}>
//           <Suspense fallback={<p className="py-3">Loading...</p>}>
//             <EditStallDialogProvider>
//               <DynamicComponent data={data} view={tab} />
//             </EditStallDialogProvider>
//           </Suspense>
//         </TabsContent>
//       ) : (
//         <div className="max-w-xl">
//           <Occupancy occupancy={data.occupancy} />
//         </div>
//       )}
//     </Tabs>
//   );
}
