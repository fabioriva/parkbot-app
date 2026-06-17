import { Trash } from "lucide-react";
import { useState } from "react";
import { useLoaderData, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

export const ExitQueue = ({ queue }) => {
  const loaderData = useLoaderData();
  const params = useParams();

  const [queueItem, setQueueItem] = useState({ card: 0, index: 0 });
  const handleConfirm = async () => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/queue/delete`;
    const result = await fetcher(url, {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queueItem),
    });
    console.log(result);
  };
  return (
    <Dialog>
      {queue.map((item, key) => (
        <DialogTrigger key={key} asChild>
          <Item size="sm" className="px-0 py-1 gap-6" key={key}>
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
                onClick={() =>
                  setQueueItem({ card: item.card, index: key + 1 })
                }
              >
                <Trash />
              </Button>
            </ItemActions>
          </Item>
        </DialogTrigger>
      ))}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.exit_queue_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.exit_queue_dialog_description({
              card: queueItem.card,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="mb-1.5" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline"> {m.cancel()}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm}> {m.confirm()}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
