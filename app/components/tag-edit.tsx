import { useState, useEffect } from "react";
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
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { m } from "@paraglide/messages.js";

export function EditTagDialog({ open, onConfirm, onOpenChange, tag }) {
  const t = (t) => t;
  const [error, setError] = useState(false);
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(tag?.code);
  }, [tag]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce
      .string()
      .length(3)
      .regex(/^[a-fA-F0-9]{3}$/);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
    } else {
      setError(false);
    }
    setValue(e.target.value);
  };
  const handleConfirm = () => {
    setError(false);
    onConfirm(value);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.tags_edit_dialog_title({ nr: tag.nr })}</DialogTitle>
          <DialogDescription>
            {m.tags_edit_dialog_description({ nr: value })}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="pin">
            {m.tags_edit_dialog_field_label()}
          </FieldLabel>
          <Input
            className="uppercase"
            minLength={3}
            maxLength={3}
            name="pin"
            value={value}
            onChange={handleChange}
          />
          {error && <FieldError>{m.tags_edit_dialog_field_error()}</FieldError>}
          <FieldDescription>
            {m.tags_edit_dialog_field_description()}
          </FieldDescription>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setError(false);
              }}
            >
              {m.cancel()}
            </Button>
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
