import { useState } from "react";
import { useParams } from "react-router";
import { z } from "zod";
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
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { useConfirmDialog } from "~/components/confirm-dialog";
import fetcher from "~/lib/fetch";
import toast from "~/lib/toast";
import { m } from "@paraglide/messages.js";

export function ActionPP({ action, disabled = true }) {
  const params = useParams();
  const { showConfirmDialog } = useConfirmDialog();
  const [destination, setDestination] = useState(undefined);
  const [error, setError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(action.min).max(action.max);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
      setDestination(undefined);
    } else {
      setError(false);
      setDestination(result.data);
    }
  };
  const handleConfirm = (item) => {
    const value =
      item.key === "A" || item.key === "B" ? item.value : destination;
    showConfirmDialog({
      title: m.action_pp_confirm_dialog_title(),
      description: m.action_pp_confirm_dialog_description({
        key: item.key,
        value,
      }),
      onConfirm: async () => {
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
            value,
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
                  <Item variant="outline" size="xs" key={key}>
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

        {action.buttons.some((b) => b.key !== "A" && b.key !== "B") && (
          <>
            <Field>
              <FieldLabel htmlFor="destination">Destination</FieldLabel>
              <Input
                id="destination"
                min={action.min}
                max={action.max}
                // placeholder="Enter destination"
                type="number"
                value={destination}
                onChange={handleChange}
              />
              <FieldDescription>
                Enter a valid destination. Range {action.min} - {action.max}.
              </FieldDescription>
            </Field>
            <div className="flex flex-col gap-3">
              {action.buttons.map((item, key) => {
                if (item.key === "D" || item.key === "E" || item.key === "F")
                  return (
                    <Item variant="outline" size="xs" key={key}>
                      <ItemContent>
                        <ItemTitle className="first-letter:uppercase">
                          {item.tooltip}
                        </ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <Button
                          // variant="primary"1
                          size="sm"
                          disabled={
                            !(destination > 0 && destination <= action.max) ||
                            error.status
                          }
                          onClick={() => handleConfirm(item)}
                        >
                          DESTINATION + {item.key}
                        </Button>
                      </ItemActions>
                    </Item>
                  );
              })}
            </div>
          </>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{m.close()}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
