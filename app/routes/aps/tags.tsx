import { requireAps } from "~/lib/authorization.server"
import { Pencil, Tag as TagIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router"
import InfiniteScroll from "react-infinite-scroll-component"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
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
import { PageDataCache } from "~/components/page-data-cache"
import { connectReconnectingWebSocket } from "~/hooks/use-ws"
import { getToken } from "~/lib/cookie.server"
import { actionResponse } from "~/lib/action"
import fetcher from "~/lib/fetch"
import useSWR, { useSWRConfig } from "swr"
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
    <PageDataCache key={`${params.aps}:${loaderData.token}`}>
      <TagsContent
        aps={params.aps}
        initialData={loaderData.data}
        token={loaderData.token}
      />
    </PageDataCache>
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
  const [initialDataValid, setInitialDataValid] = useState(true)
  const { unload } = useSWRConfig()
  const ready = plantReady === true && cardsConnected === true
  const readyRef = useRef(ready)
  const url = `${import.meta.env.VITE_BACKEND_URL}/${aps}/cards`
  const {
    data: tags,
    error,
    mutate,
  } = useSWR<TagData[]>(
    ready && token ? [url, token] : null,
    ([url, token]: [string, string]) =>
      fetcher(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    {
      fallbackData: initialDataValid ? initialData : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  useEffect(() => {
    readyRef.current = ready
    if (plantReady === false || cardsConnected === false) {
      setInitialDataValid(false)
      unload({ revalidate: false })
    }
  }, [plantReady, cardsConnected, ready, unload])

  useEffect(() => {
    setCardsConnected(null)
    return connectReconnectingWebSocket(
      `${import.meta.env.VITE_WEBSOCK_URL}/${aps}/cards`,
      {
        onOpen: () => setCardsConnected(true),
        onClose: () => {
          readyRef.current = false
          setCardsConnected(false)
        },
        onMessage: (event) => {
          if (!readyRef.current) return
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
    <div className="w-full space-y-3 lg:max-w-xl">
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
        placeholder={m.tags_search_placeholder()}
        handleSearch={handleSearch}
      />
      <InfiniteScroll
        dataLength={visibleTags.length}
        next={loadMore}
        hasMore={hasMore}
        loader={null}
        endMessage={
          <p className="pt-6 text-sm text-muted-foreground">
            {m.tags_all_loaded()}
          </p>
        }
      >
        <ItemGroup className="gap-3">
          {visibleTags.map((tag) => (
            <Item
              variant="outline"
              className="gap-3 rounded-xl bg-card p-4 sm:flex-nowrap"
              key={tag.nr}
              role="listitem"
            >
              <ItemMedia
                variant="icon"
                className="size-9 rounded-lg border bg-muted/40 text-muted-foreground"
              >
                <TagIcon aria-hidden="true" />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <ItemTitle className="line-clamp-none max-w-full font-semibold [overflow-wrap:anywhere]">
                    {m.tags_item_name({ nr: tag.nr })}
                  </ItemTitle>
                  <Badge
                    className={
                      tag.status === 0
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }
                  >
                    {tag.status === 0
                      ? m.tags_item_description_valid()
                      : m.tags_item_description_parked({ nr: tag.status })}
                  </Badge>
                </div>
                <ItemDescription className="line-clamp-none text-sm [overflow-wrap:anywhere]">
                  {m.tags_edit_dialog_field_label()}
                  {": "}
                  <span className="font-mono text-base font-semibold text-foreground tabular-nums">
                    {tag.code}
                  </span>
                </ItemDescription>
              </ItemContent>
              <ItemActions className="w-full sm:w-auto">
                <Button
                  className="h-9 w-full gap-2 sm:w-auto"
                  variant="outline"
                  aria-label={m.tags_edit_pin_label({ nr: tag.nr })}
                  onClick={() => handleEdit(tag)}
                  disabled={!isEditable}
                >
                  <Pencil aria-hidden="true" />
                  {m.tags_edit_pin()}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </InfiniteScroll>
    </div>
  )
}
