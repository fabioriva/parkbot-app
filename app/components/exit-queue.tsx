import { Trash } from "lucide-react";
import React, { useState } from "react";
// import { Form } from "react-router";
// import SubmitFormButton from "~/components/submit-form-button";
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
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";

interface ExitQueueProps {}

// const Item = () => {};

export function ExitQueue({ queue }: ExitQueueProps) {
  const [queueItem, setQueueItem] = useState({ card: 0, index: 0 });
  const handleConfirm = async () => {
    console.log(queueItem);
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Exit queuue</CardTitle>
        <CardDescription>No waiting calls</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          {/* queue.map((item, key) =>{ ... }) */}
          <DialogTrigger asChild>
            <Item size="sm" className="px-0 py-1">
              {/* <ItemMedia>m</ItemMedia> */}
              <ItemContent>
                <ItemTitle>Next</ItemTitle>
                <ItemDescription>Card 6, stall 67</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label="Delete"
                  onClick={() => setQueueItem({ card: 123, index: 1 })} // (item.card, key + 1)
                >
                  <Trash />
                </Button>
              </ItemActions>
            </Item>
            {/* <Item size="sm" className="px-0 py-1">
          <ItemMedia>m</ItemMedia>
          <ItemContent>
            <ItemTitle>2° call</ItemTitle>
            <ItemDescription>Card 123, stall 8</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
              aria-label="Delete"
            >
              <Trash />
            </Button>
          </ItemActions>
        </Item> */}
          </DialogTrigger>
          {/* )} // end map */}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete exit call</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete card ... from the exit queue?
              </DialogDescription>
            </DialogHeader>
            {/* <div className="grid gap-3">
              <Label htmlFor="card">Card number</Label>
              <Input
                id="card"
                name="card"
                type="number"
                value={card}
                onChange={(e) => setCard(e.target.value)}
              />
            </div> */}
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
        <ExitCall />
      </CardFooter>
    </Card>
  );
}
