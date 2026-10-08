import { Tag as TagIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router"
import InfiniteScroll from "react-infinite-scroll-component"
import { Button } from "~/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item"
import { useConfirmDialog } from "~/components/confirm-dialog"
import { SearchInput } from "~/components/search-input"
import { EditTagDialog } from "~/components/tag-edit"
import { NoDataAlert } from "~/components/no-data-alert"
import { useData } from "~/hooks/use-ws"
import { getToken } from "~/lib/cookie.server"
import { actionResponse } from "~/lib/action"
import fetcher from "~/lib/fetch"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/tags"
import type { Route as ApsLayoutRoute } from "./+types/layout"

interface TagData {
  nr: number
  code: string
  status: number
  type?: number
  uid?: string
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request)
  const url = `${process.env.BACKEND_URL}/${params?.aps}/cards`
  const data: TagData[] | null = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return { data, token }
}

export default function Tags({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />

  return (
    <TagsContent
      key={params.aps}
      aps={params.aps}
      initialData={loaderData.data}
      token={loaderData.token}
    />
  )
}

function TagsContent({
  aps,
  initialData,
  token,
}: {
  aps: string
  initialData: TagData[]
  token: Route.ComponentProps["loaderData"]["token"]
}) {
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/cards`
  const { data } = useData(url, { initialData })
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState<TagData | null>(null)

  const { showConfirmDialog } = useConfirmDialog()
  const handleConfirm = (pin: string) => {
    if (!tag) return
    showConfirmDialog({
      title: m.tags_confirm_dialog_title(),
      description: m.tags_edit_dialog_description({ nr: tag.nr }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/card/edit`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ card: tag.nr, code: pin }),
        })
        actionResponse(res)
      },
    })
  }
  const handleEdit = (tag: TagData) => {
    setOpen(true)
    setTag(tag)
  }
  // Fuzzy search
  const [search, setSearch] = useState<TagData[] | null>(null)
  const searchRequest = useRef(0)
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const request = ++searchRequest.current
    const query = e.target.value
    if (!query.trim()) {
      setSearch(null)
      return
    }
    const Fuse = (await import("fuse.js")).default
    if (request !== searchRequest.current) return
    const fuse = new Fuse(data, {
      keys: ["code", "nr", "type", "uid"],
    })
    const result = fuse.search(query)
    setSearch(result.map((obj) => obj.item))
  }
  // Infinite scroll
  const chunkSize = 20
  const [tags, setTags] = useState<TagData[]>(() => data.slice(0, chunkSize))
  const [hasMore, setHasMore] = useState(data.length > chunkSize)
  useEffect(() => {
    const items = search ?? data
    setTags(items.slice(0, chunkSize))
    setHasMore(items.length > chunkSize)
  }, [data, search])
  const loadMore = () => {
    const nextLength = tags.length + chunkSize
    const items = search ?? data
    const nextSlice = items.slice(0, nextLength)
    setTags(nextSlice)
    setHasMore(nextSlice.length < items.length)
  }

  const { user } =
    useOutletContext<
      Pick<ApsLayoutRoute.ComponentProps["loaderData"], "user">
    >()
  const isEditable = user?.role === "admin" || user?.role === "service"

  return (
    <div className="w-full space-y-3 lg:max-w-sm">
      {tag && (
        <EditTagDialog
          open={open}
          onConfirm={handleConfirm}
          onOpenChange={setOpen}
          tag={tag}
        />
      )}
      <SearchInput
        search={search ?? []}
        placeholder={"Search by number, pin..."}
        handleSearch={handleSearch}
      />
      <InfiniteScroll
        dataLength={tags.length}
        next={loadMore}
        hasMore={hasMore}
        loader={null}
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
                  disabled={!isEditable}
                >
                  Edit
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </InfiniteScroll>
    </div>
  )
}
