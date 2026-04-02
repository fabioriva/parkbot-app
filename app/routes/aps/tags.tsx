import { Tag as TagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
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
  const url = `${process.env.BACKEND_URL}/${params?.aps}/cards`;
  return await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

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
    setSearch(result.map((obj) => obj["item"]).flat());
  };
  // Infinite scroll
  const chunkSize = 10;
  const [tags, setTags] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setTags(
      search.length === 0
        ? data.slice(0, chunkSize)
        : search.slice(0, chunkSize),
    );
    if (search.length !== 0 && search.length <= chunkSize) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [data, search]);

  const loadMore = () => {
    const nextLength = tags.length + chunkSize;
    const nextSlice =
      search.length === 0
        ? data.slice(0, nextLength)
        : search.slice(0, nextLength);
    setTags(nextSlice);
    if (
      nextSlice.length >= data.length ||
      (search.length > 0 && nextSlice.length >= search.length)
    )
      setHasMore(false);
  };

  return (
    <>
      <SearchInput
        search={search}
        placeholder={"Search by number, pin..."}
        handleSearch={handleSearch}
      />
      <InfiniteScroll
        dataLength={tags.length}
        next={loadMore}
        hasMore={hasMore}
        // loader={<p className="pt-6">Loading more tags…</p>}
        endMessage={<p className="pt-6">All tags loaded.</p>}
      >
        <ItemGroup className="w-full lg:max-w-sm gap-3">
          {tags.map((tag) => (
            <Item variant={tag.status === 0 ? "outline" : "muted"} key={tag.nr}>
              <ItemMedia variant="icon">
                <TagIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  Tag {tag.nr} {tag.code !== "0" && `PIN ${tag.code}`}
                </ItemTitle>
                <ItemDescription>
                  {tag.status === 0
                    ? "Valid for entry"
                    : `Parked in slot ${tag.status}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tag)}
                >
                  Edit
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </InfiniteScroll>
    </>
  );
}
