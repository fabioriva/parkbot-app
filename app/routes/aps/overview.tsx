import { Device } from "~/components/device";

import type { Route } from "./+types/overview";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/overview`;
  const res = await fetch(url);
  const data = await res.json();
  return { data };
}

export default function Overview({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
      {loaderData?.data.devices.flat(1).map((item, key) => (
        <Device device={item} key={key} />
      ))}
    </div>
  );
}
