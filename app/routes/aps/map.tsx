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
import { getToken } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/map";

const components = {
  aa: lazy(() => import("~/components/maps/aa")),
  agami: lazy(() => import("~/components/maps/agami")),
  alumim: lazy(() => import("~/components/maps/alumim")),
  aminadav16: lazy(() => import("~/components/maps/aminadav-16")),
  aminadav1820: lazy(() => import("~/components/maps/aminadav-1820")),
  amore: lazy(() => import("~/components/maps/amore-edge")),
  boi: lazy(() => import("~/components/maps/boi")),
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  chandan: lazy(() => import("~/components/maps/chandan")),
  chiattone: lazy(() => import("~/components/maps/chiattone")),
  "daman-n": lazy(() => import("~/components/maps/daman-n")),
  donini: lazy(() => import("~/components/maps/donini")),
  ehad: lazy(() => import("~/components/maps/ehad")),
  gazit: lazy(() => import("~/components/maps/gazit")),
  hdante: lazy(() => import("~/components/maps/hotel-dante")),
  herzel: lazy(() => import("~/components/maps/herzel")),
  ironbank: lazy(() => import("~/components/maps/ironbank")),
  kg: lazy(() => import("~/components/maps/kaveri-gold")),
  kgmarg: lazy(() => import("~/components/maps/kg-marg")),
  knl: lazy(() => import("~/components/maps/kamla-nagar")),
  knr: lazy(() => import("~/components/maps/kamla-nagar")),
  krishna: lazy(() => import("~/components/maps/krishna-kunj")),
  matalon: lazy(() => import("~/components/maps/matalon")),
  menloa: lazy(() => import("~/components/maps/menlo-a")),
  menlob: lazy(() => import("~/components/maps/menlo-b")),
  muse: lazy(() => import("~/components/maps/muse")),
  nhidcl: lazy(() => import("~/components/maps/nhidcl")),
  parshvnath: lazy(() => import("~/components/maps/parshvnath")),
  ruth: lazy(() => import("~/components/maps/ruth")),
  sdmc: lazy(() => import("~/components/maps/sdmc")),
  smoritz: lazy(() => import("~/components/maps/smoritz")),
  teenmurty: lazy(() => import("~/components/maps/teenmurty")),
  trumpeldor: lazy(() => import("~/components/maps/trumpeldor")),
  vl: lazy(() => import("~/components/maps/vl")),
  wallstreet: lazy(() => import("~/components/maps/spire")),
  washingtonblvd: lazy(() => import("~/components/maps/8888")),
  wblvd: lazy(() => import("~/components/maps/wblvd")),
  wolfson: lazy(() => import("~/components/maps/wolfson")),
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request);
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
