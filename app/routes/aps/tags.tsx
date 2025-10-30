import React, { useState } from "react";
import Fuse from "fuse.js";
import { Search, Tag } from "lucide-react";
import { Error } from "~/components/error";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  // fuzzy search
  const [search, setSearch] = useState([]);
  const handleSearch = async (e) => {
    const Fuse = (await import("fuse.js")).default;
    const fuse = new Fuse(data, {
      keys: ["code", "nr", "type", "uid"],
    });
    const result = fuse.search(e.target.value);
    console.log(result);
    setSearch(result);
  };
  return (
    <React.Fragment>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
        </div>
        <Input
          // id={id}
          type="text"
          placeholder="Search tag by number or PIN ..."
          className="pl-9"
          onChange={handleSearch}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {search.length === 0 &&
          data.map((item) => (
            <Item className="min-w-xs" variant="outline" key={item.nr}>
              <ItemMedia
                variant="icon"
                className={
                  item.status !== 0 && "bg-orange-700/20 text-orange-700"
                }
              >
                <Tag />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  Tag {item.nr} {item.code !== "0" && `PIN ${item.code}`}
                </ItemTitle>
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
          ))}
        {search.length > 0 &&
          search.map(({ item }) => (
            <Item className="min-w-xs" variant="outline" key={item.nr}>
              <ItemMedia
                variant="icon"
                className={
                  item.status !== 0 && "bg-orange-700/20 text-orange-700"
                }
              >
                <Tag />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  Tag {item.nr} {item.code !== "0" && `PIN ${item.code}`}
                </ItemTitle>
                <ItemDescription>
                  {item.status !== 0
                    ? `Parked in slot ${item.status}`
                    : "Valid for entry"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </ItemActions>
            </Item>
          ))}
      </div>
    </React.Fragment>
  );
}
