import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Error } from "~/components/error";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  // ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/racks";

export async function loader({ params }: Route.LoaderArgs) {
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/racks`;
  const data = await fetcher(url);
  return { data };
}

export default function Racks({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  // console.log(loaderData?.data);
  // const data = loaderData?.data;
  // fetch data every x ms
  const [data, setData] = useState(loaderData?.data);
  const fetcher = useFetcher();
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/aps/${params.aps}/racks`);
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetcher]);
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data["data"]);
    }
  }, [fetcher.data]);

  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item) => (
        <Item
          className="w-64"
          // className={`w-64 ${item.online.status ? "bg-ready/20" : "bg-alert/20"}`}
          variant="outline"
          key={item.deviceNr}
          asChild
        >
          <a
            href={`/aps/${params?.aps}/racks/${item.rack.nr}?name=${item.deviceName}&nr=${item.deviceNr}`}
          >
            <ItemContent>
              <ItemTitle>{item.deviceName}</ItemTitle>
              <ItemDescription>
                {item.type} {item.key}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              {item.online.status ? (
                <CircleCheck className="text-ready" />
              ) : (
                <CircleX className="text-alert" />
              )}
            </ItemActions>
          </a>
        </Item>
      ))}
    </div>
  );
}
