import { useState } from "react";
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
import {
  Field,
  FieldError,
  FieldDescription,
  // FieldGroup,
  FieldLabel,
  // FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
// import { useConfirmDialog } from "~/components/confirm-dialog";
import { m } from "@paraglide/messages.js";

export function ExitCall({ exit }) {
  // const { showConfirmDialog } = useConfirmDialog();

  const { enable, max, min } = exit;
  const [card, setCard] = useState(min);
  const [error, setError] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
      setCard(Number(e.target.value));
    } else {
      setError(false);
      setCard(result.data);
    }
  };
  const handleConfirm = async () => {
    // showConfirmDialog({
    //   title: t("exit-call.confirmDialog.title"),
    //   description: t("exit-call.confirmDialog.description", { card }),
    //   onConfirm: (value) =>
    //     console.log(`Exit request sent for card nr ${card}`),
    // });
  };
  const handleOpen = () => {
    setError(false);
    setCard(min);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          disabled={!enable.status}
          onClick={handleOpen}
        >
          {m.exit_call()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.exit_call_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.exit_call_dialog_description({ card, stall: exit.stall })}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="card">
            {m.exit_call_dialog_field_label({ min, max })}
          </FieldLabel>
          <Input
            id="card"
            min={min}
            max={max}
            name="card"
            type="number"
            value={card}
            onChange={handleChange}
          />
          <FieldDescription>
            {m.exit_call_dialog_field_description({ min, max })}
          </FieldDescription>
          {error && (
            <FieldError>
              {m.exit_call_dialog_field_error({ min, max })}
            </FieldError>
          )}
        </Field>
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
