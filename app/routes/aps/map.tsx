import { EyeIcon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CardWrapper } from "~/components/card-wrapper";
import { EditStallDialogProvider } from "~/components/map-edit";
import { NoDataAlert } from "~/components/no-data-alert";
import { Occupancy } from "~/components/occupancy-chart";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/map";

const components = {
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  "daman-n": lazy(() => import("~/components/maps/daman-n")),
  menloa: lazy(() => import("~/components/maps/menlo-a")),
  menlob: lazy(() => import("~/components/maps/menlo-b")),
  // muse: lazy(() => import("~/components/maps/muse")),
  wallstreet: lazy(() => import("~/components/maps/spire")),
  washingtonblvd: lazy(() => import("~/components/maps/8888")),
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/map`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Map({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;

  const DynamicComponent = components[params.aps];
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/map`;
  const { data } = useData(url, { initialData: loaderData.data });
  const [tab, setTab] = useState("view2");
  const onTabChange = (value) => {
    setTab(value);
  };
  const [view, setView] = useState("view2");
  const total = (arr) => arr.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Tabs defaultValue="map">
      <div className="flex gap-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="map">{m.map_tabs_main()}</TabsTrigger>
          <TabsTrigger value="occupancy">{m.map_tabs_occupancy()}</TabsTrigger>
        </TabsList>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <EyeIcon /> {m.map_view()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{m.map_view_label()}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={view} onValueChange={setView}>
                <DropdownMenuRadioItem value="view0">
                  {m.map_view_icon()}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="view3">
                  {m.map_view_size()}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="view2">
                  {m.map_view_slot()}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="view1">
                  {m.map_view_status()}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TabsContent value="map">
        <Suspense fallback={<p className="py-3">Loading...</p>}>
          <EditStallDialogProvider>
            <DynamicComponent data={data} view={view} />
          </EditStallDialogProvider>
        </Suspense>
      </TabsContent>
      <TabsContent value="occupancy" className="max-w-xl">
        <CardWrapper
          title={m.occupancy_title()}
          description={m.occupancy_total_count({
            count: total(data.occupancy),
          })}
        >
          <Occupancy occupancy={data.occupancy} />
        </CardWrapper>
      </TabsContent>
    </Tabs>
  );
}
