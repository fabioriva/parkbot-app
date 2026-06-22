import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";
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
import { NoDataAlert } from "~/components/no-data-alert";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import useSWR from "swr";

import type { Route } from "./+types/racks";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function Nodes({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData) return <NoDataAlert />;

  const [racks, setRacks] = useState(loaderData);

  const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/racks`;
  const { data } = useSWR(url, fetcher, {
    fallbackData: racks,
    refreshInterval: 1000,
  });
  useEffect(() => setRacks(data), [data]);

  return (
    <ItemGroup className="w-full lg:max-w-sm gap-3">
      {data.map((item) => (
        <Item variant="outline" key={item.deviceNr}>
          <ItemMedia variant="icon">
            {item.online.status ? (
              <CircleCheck className="stroke-green-500" />
            ) : (
              <CircleX className="stroke-red-500" />
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Profinet node {item.deviceName}</ItemTitle>
            <ItemDescription>
              Node {item.deviceNr} Type {item.type}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline" onClick={() => handleEdit(tag)}>
              <a
                className="flex items-center justify-center"
                href={`/aps/${params.aps}/rack/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
              >
                View
              </a>
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
