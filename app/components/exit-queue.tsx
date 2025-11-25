import { Trash } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  ItemTitle,
} from "~/components/ui/item";

interface ExitQueueProps {
  exit: any;
  queue: any;
}

export function ExitQueue({ exit, queue }: ExitQueueProps) {
  // console.log(queue);
  const { t } = useTranslation();
  const [queueItem, setQueueItem] = useState({ card: 0, index: 0 });
  const handleConfirm = async () => {
    console.log(queueItem);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("aps.exit-queue.card-title")}</CardTitle>
        <CardDescription>
          {queue.filter((item) => item.card !== 0).length === 0
            ? t("aps.exit-queue.card-no-calls")
            : t("aps.exit-queue.card-calls", { count: queue.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          {queue
            .filter((item: any) => item.card !== 0)
            .map((item: any, key: any) => (
              <DialogTrigger key={key} asChild>
                <Item size="sm" className="px-0 py-1 gap-6" key={key}>
                  <ItemContent className="">
                    <ItemTitle>
                      {key === 0
                        ? t("aps.exit-queue.item-next")
                        : t("aps.exit-queue.item-title", { key: key + 1 })}
                    </ItemTitle>
                    <ItemDescription>
                      {t("aps.exit-queue.item-description", {
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("aps.exit-queue.dialog-title")}</DialogTitle>
              <DialogDescription>
                {t("aps.exit-queue.dialog-description", {
                  card: queueItem.card,
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="mb-1.5" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline"> {t("aps.cancel")}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleConfirm}> {t("aps.confirm")}</Button>
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
