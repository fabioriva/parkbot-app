import { Loader } from "lucide-react";
import { lazy, Fragment, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Error } from "~/components/error";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { getSessionCookie } from "~/lib/session.server";
import { useData } from "~/hooks/use-ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/map";

const components = {
  bugrashov: lazy(() => import("~/components/maps/bugrashov")),
  daman: lazy(() => import("~/components/maps/daman")),
  menloa: lazy(() => import("~/components/maps/menloa")),
  menlob: lazy(() => import("~/components/maps/menlob")),
  wallstreet: lazy(() => import("~/components/maps/wallstreet")),
};

export async function loader({ params, request }: Route.LoaderArgs) {
  // console.log(params);
  const { token } = await getSessionCookie(request);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/map`;
  // const { error, data } = await fetcher(url, {
  const data = await fetcher(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  // console.log('/map loader error', error);
  // return { error, data };
  return { data, token };
}

export default function Map({ loaderData, params }: Route.ComponentProps) {
  // if (!loaderData?.data) return <Error error={loaderData?.error} />;
  if (!loaderData?.data) return <Error />;
  const { t } = useTranslation();
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/map`;
  const { data } = useData(url, { initialData: loaderData?.data });
  const [view, setView] = useState("view-2");
  const DynamicComponent = components[params.aps];
  return (
    <Fragment>
      <div className="flex justify-start gap-3 py-1.5">
        <span>{t("aps.map.select-view")}:</span>
        <RadioGroup
          className="grid-flow-col"
          orientation="horizontal"
          value={view}
          onValueChange={(value) => setView(value)}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-1" id="r1" />
            <Label htmlFor="r1">{t("aps.map.radio-card")}</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-2" id="r2" />
            <Label htmlFor="r2">{t("aps.map.radio-slot")}</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="view-3" id="r3" />
            <Label htmlFor="r3">{t("aps.map.radio-size")}</Label>
          </div>
        </RadioGroup>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader
              role="status"
              aria-label="Loading"
              className="animate-spin size-8 mr-3"
            />
            Loading
          </div>
        }
      >
        <DynamicComponent data={data} view={view} />
      </Suspense>
    </Fragment>
  );
}
