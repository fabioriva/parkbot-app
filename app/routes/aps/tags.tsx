import { Tag } from "lucide-react";
import { Error } from "~/components/error";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { useData } from "~/lib/ws";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/map";

export async function loader({ params }: Route.LoaderArgs) {
  // console.log(params);
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/cards`;
  const data = await fetcher(url);
  return { data };
}

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData?.data) return <Error />;
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/map`;
  const { data } = useData(url, { initialData: loaderData?.data });
  console.log(data[0]);

  return (
    <div className="flex flex-wrap gap-3">
      {data.map((item) => (
        // <div className="basis-1/2 max-w-1/2 p-2flex w-full min-w-sm flex-col gap-6">
        <Item className="min-w-xs" variant="outline" key={item.nr}>
          <ItemMedia
            variant="icon"
            className={item.status !== 0 && "bg-orange-700/20 text-orange-700"}
          >
            <Tag />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              Tag {item.nr} {item.code !== "0" && `PIN ${item.code}`}
            </ItemTitle>
            {/* <ItemDescription>PIN code {item.code}</ItemDescription> */}
            <ItemDescription>
              {item.status !== 0
                ? `Parked in slot ${item.status}`
                : "Valid fo entry"}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </ItemActions>
        </Item>
        // </div>
      ))}
    </div>
  );
}
