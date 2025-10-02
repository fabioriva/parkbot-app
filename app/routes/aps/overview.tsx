import { Device } from "~/components/device";
import { useData } from "~/lib/ws";

import type { Route } from "./+types/overview";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/overview`;
  const res = await fetch(url);
  const data = await res.json();
  return { aps: params?.aps, data };
}

export default function Overview({ loaderData }: Route.ComponentProps) {
  // console.log(loaderData);
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${loaderData?.aps}/overview`;
  const { data } = useData(url, { initialData: loaderData?.data });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {data.devices.flat(1).map((item, key) => (
        <Device device={item} enhanced={true} key={key} />
      ))}
    </div>
  );
}
