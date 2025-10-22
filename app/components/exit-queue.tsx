import { Trash } from "lucide-react";
import React, { useState } from "react";
import ExitCall from "~/components/exit-call";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  // ItemGroup,
  // ItemMedia,
  // ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";

interface ExitQueueProps {}

// const ExitQueueItem = ({ item, index }) => (
//   <Item size="sm" className="px-0 py-1">
//     <ItemContent>
//       <ItemTitle>{index === 0 ? "Next" : index + 1 + "° call"}</ItemTitle>
//       <ItemDescription>
//         Card {item.card} parked in stall {item.stall}
//       </ItemDescription>
//     </ItemContent>
//     <ItemActions>
//       <Button
//         size="icon"
//         variant="outline"
//         className="rounded-full"
//         aria-label="Delete"
//         onClick={() => setQueueItem({ card: item.card, index: index + 1 })}
//       >
//         <Trash />
//       </Button>
//     </ItemActions>
//   </Item>
// );

export function ExitQueue({ exit, queue }: ExitQueueProps) {
  // console.log(queue);
  const [queueItem, setQueueItem] = useState({ card: 0, index: 0 });
  const handleConfirm = async () => {
    console.log(queueItem);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exit queue</CardTitle>
        <CardDescription>
          {queue.filter((item) => item.card === 0).length === 0
            ? "No waiting exit calls"
            : queue.length + " exit calls waiting"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          {queue.map((item, key) => (
            <DialogTrigger key={key} asChild>
              {/* <ExitQueueItem item={item} index={key} key={key} /> */}
              <Item size="sm" className="px-0 py-1 gap-6" key={key}>
                <ItemContent className="">
                  <ItemTitle>
                    {key === 0 ? "Next" : key + 1 + "° call"}
                  </ItemTitle>
                  <ItemDescription>
                    Card {item.card} parked in stall {item.stall}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete exit call</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete card {queueItem.card} from the
                exit queue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleConfirm}>Confirm</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter>
        <ExitCall exit={exit} />
      </CardFooter>
    </Card>
  );
}
