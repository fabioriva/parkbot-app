import { Circle, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/nodes";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/racks`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Nodes({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const [data, setData] = useState(loaderData);

  // return (
  //   <div>
  //     <h2>Data</h2>
  //     <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // );

  return (
    <ItemGroup className="w-full lg:max-w-sm gap-3">
      {data.map((item) => (
        <Item variant="outline" key={item.deviceNr}>
          {/* <ItemMedia variant="image">
            <img
              src={`https://github.com/shadcn.png`}
              alt={"song.title"}
              width={32}
              height={32}
              className="object-cover grayscale"
            />
          </ItemMedia> */}
          <ItemContent>
            <ItemTitle>Profinet node {item.deviceName}</ItemTitle>
            <ItemDescription>
              Node {item.deviceNr} Type {item.type}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Circle
              className={`size-4 ${item.online.status ? "fill-green-500 stroke-green-500" : "fill-red-500  stroke-red-500"}`}
            />
            <Button variant="ghost" size="icon" asChild>
              <a
                href={`/${params.aps}/racks/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
              >
                <ExternalLinkIcon className="size-4" />
              </a>
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
