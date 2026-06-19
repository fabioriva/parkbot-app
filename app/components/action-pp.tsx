// import { useState } from "react";
import { useParams } from "react-router";
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
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "~/components/ui/tooltip";
import { useConfirmDialog } from "~/components/confirm-dialog";
import fetcher from "~/lib/fetch";
import toast from "~/lib/toast";
import { m } from "@paraglide/messages.js";

export function ActionPP({ action, disabled = true }) {
  const params = useParams();
  const { showConfirmDialog } = useConfirmDialog();
  // const [error, setError] = useState(false);
  const handleConfirm = (item) => {
    console.log(action, item);
    showConfirmDialog({
      title: m.action_pp_confirm_dialog_title(),
      description: m.action_pp_confirm_dialog_description({
        key: item.key,
        value: item.value,
      }),
      onConfirm: async (value) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/operation/pp`;
        const res = await fetcher(url, {
          method: "POST",
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device: action.device,
            key: item.key,
            value: item.value,
          }),
        });
        toast(res);
      },
    });
  };
  const handleOpen = () => {};
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || !action.enable.status}
          onClick={handleOpen}
        >
          {action.key}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.action_pp_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.action_pp_dialog_description()}
          </DialogDescription>
        </DialogHeader>

        {action.buttons.some((b) => b.key === "A" || b.key === "B") && (
          <div className="flex flex-col gap-3">
            {action.buttons.map((item, key) => {
              if (item.key === "A" || item.key === "B")
                return (
                  <Item variant="outline" key={key}>
                    <ItemContent>
                      <ItemTitle className="capitalize">
                        {item.tooltip}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirm(item)}
                      >
                        {item.value} + {item.key}
                      </Button>
                    </ItemActions>
                  </Item>
                );
            })}
          </div>
        )}

        {/* {action.buttons.some((b) => b.key === "A" || b.key === "B") && (
          <div className="grid grid-cols-8 gap-1">
            {action.buttons.map((item, key) => {
              if (item.key === "A" || item.key === "B")
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <Button onClick={() => handleConfirm(item)}>
                        {item.value}+{item.key}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
            })}
          </div>
        )} */}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{m.cancel()}</Button>
          </DialogClose>
          {/* <DialogClose asChild>
            <Button onClick={handleConfirm} disabled={error}>
              {m.confirm()}
            </Button>
          </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
