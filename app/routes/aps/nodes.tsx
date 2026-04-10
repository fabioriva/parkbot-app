import { ChevronRight, CircleCheck, CircleX } from "lucide-react";
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
  const url = `${process.env.BACKEND_URL}/${params?.aps}/racks`;
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
  const clientFetcher = useFetcher();

  useEffect(() => {
    const intervalId = setInterval(() => {
      clientFetcher.load(`/aps/${params.aps}/nodes`);
    }, 2500);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (clientFetcher.data) {
      setData(clientFetcher.data);
    }
  }, [clientFetcher.data]);

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

  // return (
  //   <ItemGroup className="w-full lg:max-w-sm gap-3">
  //     {data.map((item) => (
  //       <Item variant="outline" key={item.deviceNr} asChild>
  //         <a
  //           href={`/aps/${params.aps}/rack/${item.rack.nr - 1}?deviceName=${item.deviceName}&deviceNr=${item.deviceNr}`}
  //         >
  //           <ItemMedia variant="icon">
  //             {item.online.status ? (
  //               <CircleCheck className="stroke-green-500" />
  //             ) : (
  //               <CircleX className="stroke-red-500" />
  //             )}
  //           </ItemMedia>
  //           <ItemContent>
  //             <ItemTitle>Profinet node {item.deviceName}</ItemTitle>
  //             <ItemDescription>
  //               Node {item.deviceNr} Type {item.type}
  //             </ItemDescription>
  //           </ItemContent>
  //           <ItemActions>
  //             <ChevronRight className="size-4" />
  //           </ItemActions>
  //         </a>
  //       </Item>
  //     ))}
  //   </ItemGroup>
  // );
}
