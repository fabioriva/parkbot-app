import { Trash } from "lucide-react"
import { useLoaderData, useParams } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { useConfirmDialog } from "~/components/confirm-dialog"
import { actionResponse } from "~/lib/action"
import { m } from "@paraglide/messages.js"

export const Queue = ({ queue }) => {
  const data = useLoaderData()
  const params = useParams()
  const { showConfirmDialog } = useConfirmDialog()

  const handleConfirm = async (item) => {
    showConfirmDialog({
      title: m.exit_queue_dialog_title(),
      description: m.exit_queue_dialog_description({ card: item.card }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/queue/delete`
        const res = await fetc(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...item, index: item.id }),
        })
        actionResponse(res)
      },
    })
  }

  return (
    <>
      {queue.map((item, key) => (
        <Item size="sm" className="gap-6 px-0 py-1" key={key}>
          <ItemContent className="">
            <ItemTitle>
              {key === 0
                ? m.exit_queue_item_next()
                : m.exit_queue_item_title({ position: key + 1 })}
            </ItemTitle>
            <ItemDescription>
              {m.exit_queue_item_description({
                card: item.card,
                stall: item.stall,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              aria-label="Delete"
              // onClick={() => setQueueItem({ card: item.card, index: key + 1 })}
              onClick={() => handleConfirm(item)}
            >
              <Trash />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </>
  )
}
