import { Tag as TagIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { SearchInput } from "~/components/search-input";
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
  <Item variant="outline">
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
  const { t } = useTranslation();
  const handleEdit = (tag) => {
    console.log(tag);
  };
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

  return (
    <>
      <SearchInput
        search={search}
        placeholder={"Search by number, pin..."}
        handleSearch={handleSearch}
      />
      <ItemGroup className="w-full lg:max-w-sm gap-3">
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
