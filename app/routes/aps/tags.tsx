import { Search, Tag as TagIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch.server";
import type { Route } from "./+types/tags";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.VITE_BACKEND_URL}/${params?.aps}/cards`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const Tag = ({ tag, handleEdit }) => (
  <Item className="" variant="outline">
    <ItemMedia variant="icon">
      <TagIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>
        Tag {tag.nr} {tag.code !== "0" && `PIN ${tag.code}`}
      </ItemTitle>
      <ItemDescription>
        {tag.status === 0 ? "Valid for entry" : `Parked in slot ${tag.status}`}
      </ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="sm" variant="outline" onClick={() => handleEdit(tag)}>
        Edit
      </Button>
    </ItemActions>
  </Item>
);

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData)
    return (
      <h1 className="text-lg dark:text-red-500 font-semibold">
        Data not available!
      </h1>
    );
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/cards`;
  const { data } = useData(url, { initialData: loaderData });
  // Fuzzy search
  const [search, setSearch] = useState([]);
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const Fuse = (await import("fuse.js")).default;
    const fuse = new Fuse(data, {
      keys: ["code", "nr", "type", "uid"],
    });
    const result = fuse.search(e.target.value);
    setSearch(result);
  };
  // Edit
  const handleEdit = (tag) => {
    console.log(tag);
  };

  return (
    <>
      <InputGroup className="max-w-sm">
        <InputGroupInput
          placeholder="Search by number, pin..."
          onChange={handleSearch}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {search.length} results
        </InputGroupAddon>
      </InputGroup>
      <ItemGroup className="max-w-sm gap-3">
        {search.length > 0
          ? search.map(({ item }) => (
              <Tag handleEdit={handleEdit} tag={item} key={item.nr} />
            ))
          : data.map((item) => (
              <Tag handleEdit={handleEdit} tag={item} key={item.nr} />
            ))}
      </ItemGroup>
    </>
  );
}
