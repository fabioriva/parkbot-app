import { useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { m } from "@paraglide/messages.js";

export function ActionPP({ action, disabled = true }) {
  // console.log(action);
  const [error, setError] = useState(false);
  const handleConfirm = () => {};
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
          <DialogTitle>{m.exit_call_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.exit_call_dialog_description({ card: 111 })}
          </DialogDescription>
        </DialogHeader>

        {action.buttons.some((b) => b.key === "A" || b.key === "B") && (
          <div className="grid grid-cols-8 gap-1">
            {action.buttons.map((item, key) => {
              if (item.key === "A" || item.key === "B")
                return (
                  // <Tooltip key={key}>
                  //   <TooltipTrigger>
                  <Button onClick={() => handleConfirm(item)} key={key}>
                    {item.value}+{item.key}
                  </Button>
                  //   </TooltipTrigger>
                  //   <TooltipContent>
                  //     <p>{item.tooltip}</p>
                  //   </TooltipContent>
                  // </Tooltip>
                );
            })}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{m.cancel()}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm} disabled={error}>
              {m.confirm()}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
