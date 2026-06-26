import { Tag as TagIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { EditTagDialog } from "~/components/tag-edit";
import { useConfirmDialog } from "~/components/confirm-dialog";
import { NoDataAlert } from "~/components/no-data-alert";
import { useData } from "~/hooks/use-ws";
import { getCookie } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import toast from "~/lib/toast";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/tags";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getCookie(request, "parkbot.session_token").split(".")[0];
  const url = `${process.env.BACKEND_URL}/${params?.aps}/cards`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;

  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${params.aps}/cards`;
  const { data } = useData(url, { initialData: loaderData.data });
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState({ code: "" });

  const { showConfirmDialog } = useConfirmDialog();
  const handleConfirm = (pin) => {
    showConfirmDialog({
      title: m.tags_confirm_dialog_title(),
      description: m.tags_edit_dialog_description({ nr: tag.nr }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/card/edit`;
        const res = await fetcher(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${loaderData.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ card: tag.nr, code: pin }),
        });
        toast(res);
      },
    });
  };
  const handleEdit = (tag) => {
    setOpen(true);
    setTag(tag);
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
  const chunkSize = 20;
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
    <div className="w-full lg:max-w-sm space-y-3">
      <EditTagDialog
        open={open}
        onConfirm={handleConfirm}
        onOpenChange={setOpen}
        tag={tag}
      />
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
        <ItemGroup>
          {tags.map((tag) => (
            <Item variant="outline" key={tag.nr}>
              <ItemMedia variant="icon">
                <TagIcon
                  className={
                    tag.status !== 0 ? "stroke-chart-1" : "stroke-chart-2"
                  }
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {m.tags_item_title({ nr: tag.nr, pin: tag.code })}
                </ItemTitle>
                <ItemDescription>
                  {tag.status === 0
                    ? m.tags_item_description_valid()
                    : m.tags_item_description_parked({ nr: tag.status })}
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
    </div>
  );
}
