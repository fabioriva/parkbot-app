import { requireAps } from "~/lib/authorization.server"
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
import {
  ConfirmDialogProvider,
  useConfirmDialog,
} from "~/components/confirm-dialog"
import { SearchInput } from "~/components/search-input"
import { EditTagDialog } from "~/components/tag-edit"
import { NoDataAlert } from "~/components/no-data-alert"
import { connectReconnectingWebSocket } from "~/hooks/use-ws"
import { getToken } from "~/lib/cookie.server"
import { actionResponse } from "~/lib/action"
import fetcher from "~/lib/fetch"
import useSWR from "swr"
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
  await requireAps(request, params.aps, "read")
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
  token: string | null
}) {
  const { plantReady } = useOutletContext<{ plantReady: boolean | null }>()
  const [cardsConnected, setCardsConnected] = useState<boolean | null>(null)
  const [reconnections, setReconnections] = useState(0)
  const ready = plantReady === true && cardsConnected === true
  const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/cards`
  const {
    data: tags,
    error,
    mutate,
  } = useSWR<TagData[]>(
    ready && token ? [url, token, reconnections] : null,
    ([url, token]: [string, string, number]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      fallbackData: reconnections === 0 ? initialData : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  useEffect(() => {
    if (plantReady === false) setReconnections((value) => value + 1)
  }, [plantReady])

  useEffect(() => {
    setCardsConnected(null)
    return connectReconnectingWebSocket(
      `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/cards`,
      {
        onOpen: () => setCardsConnected(true),
        onClose: () => {
          setCardsConnected(false)
          setReconnections((value) => value + 1)
        },
        onMessage: (event) => {
          // Live updates replace the snapshot without starting another HTTP read.
          void mutate(JSON.parse(event.data), { revalidate: false })
        },
      },
      token ?? undefined
    )
  }, [aps, token, mutate])

  if (plantReady === false || cardsConnected === false) {
    return <NoDataAlert description={m.tags_connection_unavailable()} />
  }
  if (error || !tags) return <NoDataAlert />

  return (
    <ConfirmDialogProvider>
      <TagsList aps={aps} tags={tags} token={token} disabled={!ready} />
    </ConfirmDialogProvider>
  )
}

function TagsList({
  aps,
  tags,
  token,
  disabled,
}: {
  aps: string
  tags: TagData[]
  token: string | null
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState<TagData | null>(null)

  const { showConfirmDialog } = useConfirmDialog()
  const handleConfirm = (pin: string) => {
    if (disabled || !tag) return
    showConfirmDialog({
      title: m.tags_confirm_dialog_title(),
      description: m.tags_edit_dialog_description({ nr: tag.nr }),
      onConfirm: async () => {
        setOpen(false)
        const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/card/edit`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ card: tag.nr, code: pin }),
        })
        await actionResponse(res)
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
    const fuse = new Fuse(tags, {
      keys: ["code", "nr", "type", "uid"],
    })
    const result = fuse.search(query)
    setSearch(result.map((obj) => obj.item))
  }
  // Infinite scroll
  const chunkSize = 20
  const [visibleCount, setVisibleCount] = useState(chunkSize)
  const filteredTags = search ?? tags
  const visibleTags = filteredTags.slice(0, visibleCount)
  const hasMore = visibleCount < filteredTags.length

  useEffect(() => {
    setVisibleCount(chunkSize)
  }, [tags, search])

  const loadMore = () => setVisibleCount((count) => count + chunkSize)

  const { user } =
    useOutletContext<
      Pick<ApsLayoutRoute.ComponentProps["loaderData"], "user">
    >()
  const isEditable =
    !disabled && (user?.role === "admin" || user?.role === "service")

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
        dataLength={visibleTags.length}
        next={loadMore}
        hasMore={hasMore}
        loader={null}
        endMessage={<p className="pt-6">All tags loaded.</p>}
      >
        <ItemGroup>
          {visibleTags.map((tag) => (
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
