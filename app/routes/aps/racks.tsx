import { ChevronRightIcon, CircleCheck } from "lucide-react";
import { Error } from "~/components/error";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
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
  console.log(loaderData?.data);
  const data = loaderData?.data;
  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item) => (
        <Item
          // className="min-w-xs"
          className={`w-64 ${item.online.status ? "bg-ready/20" : "bg-alert/20"}`}
          variant="outline"
          key={item.deviceNr}
          asChild
        >
          <a
            href={`/${params?.aps}/rack/${item.rack.nr}?name=${item.deviceName}&nr=${item.deviceNr}`}
          >
            <ItemContent>
              <ItemTitle>{item.deviceName}</ItemTitle>
              <ItemDescription>
                {item.type} {item.key}
              </ItemDescription>
            </ItemContent>
            <ItemActions
              className={item.online.status ? "text-ready" : "text-alert"}
            >
              <CircleCheck />
            </ItemActions>
          </a>
        </Item>
      ))}
    </div>
  );
}
