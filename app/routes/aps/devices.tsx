import clsx from "clsx";
import { Device } from "~/components/device";
import { NoDataAlert } from "~/components/no-data-alert";
import { getCookie } from "~/lib/cookie.server";
import { useData } from "~/hooks/use-ws";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/devices";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/overview`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Devices({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/overview`;
  const { data } = useData(url, { initialData: loaderData.data });
  const COLS = data.devices[0].length;
  return (
    <div
      className={clsx("grid grid-col-1 lg:grid-cols-2 gap-4", {
        "xl:grid-cols-2": COLS <= 2,
        "xl:grid-cols-3": COLS === 3,
        "xl:grid-cols-4": COLS >= 4,
      })}
    >
      {data.devices.flat(1).map((item, key) => (
        <Device advanced device={item} key={key} />
      ))}
    </div>
  );
}
