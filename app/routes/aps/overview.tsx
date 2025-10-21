import clsx from "clsx";
import { Device } from "~/components/device";
import { Error } from "~/components/error";
import { ExitQueue } from "~/components/exit-queue";
import { useData } from "~/lib/ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/overview";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/overview`;
  const data = await fetcher(url);
  return { aps: params?.aps, data };
}

export default function Overview({ loaderData }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${loaderData?.aps}/overview`;
  const { data } = useData(url, { initialData: loaderData?.data });
  const COLS = data.devices[0].length;
  return (
    <div
      className={clsx("grid grid-col-1 lg:grid-cols-2 gap-4 items-start", {
        "xl:grid-cols-2": COLS <= 2,
        "xl:grid-cols-3": COLS === 3,
        "xl:grid-cols-4": COLS >= 4,
      })}
    >
      {data.devices.flat(1).map((item, key) => (
        <Device device={item} enhanced={true} key={key} />
      ))}
      <ExitQueue
        exit={data.exitQueue.exitButton}
        queue={data.exitQueue.queueList}
      />
    </div>
  );
}
