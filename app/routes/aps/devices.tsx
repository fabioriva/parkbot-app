import clsx from "clsx";
import { Device } from "~/components/device";
// import { ExitQueue } from "~/components/exit-queue";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/devices";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/overview`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Devices({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/overview`;
  const { data } = useData(url, { initialData: loaderData });
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
        <Device advanced device={item} key={key} />
      ))}
      {/* <ExitQueue
        exit={data.exitQueue.exitButton}
        queue={data.exitQueue.queueList}
      /> */}
    </div>
  );
}
