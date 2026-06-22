"use client";

import { createContext, useContext, useState } from "react";
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

const EditStallDialogContext = createContext();

export const useEditStallDialog = () => {
  const context = useContext(EditStallDialogContext);
  if (!context) {
    throw new Error("useEditDialog must be used within EditDialogProvider");
  }
  return context;
};

export function EditStallDialogProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});
  const showEditDialog = (opts) => {
    setOptions(opts);
    setOpen(true);
    setValue(opts.stall.status);
  };
  const min = 1;
  const max = options?.definitions?.cards || 1;
  const stall = options?.stall;
  const stallStatus = options?.definitions?.stallStatus;
  const [error, setError] = useState(false);
  const [value, setValue] = useState(options?.stall?.status || 0);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
      setValue(Number(e.target.value));
    } else {
      setError(false);
      setValue(result.data);
    }
  };
  const handleConfirm = (status) => {
    setOpen(false);
    options?.onConfirm?.(status);
  };

  return (
    <EditStallDialogContext.Provider value={{ showEditDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {m.map_edit_dialog_title({ nr: stall?.nr })}
            </DialogTitle>
            <DialogDescription>
              {m.map_edit_dialog_description({ nr: stall?.nr })}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="value">
              {m.map_edit_dialog_field_label()}
            </FieldLabel>
            <Input
              min={min}
              max={max}
              name="value"
              type="number"
              value={value}
              onChange={handleChange}
            />
            {error && (
              <FieldError>
                {m.map_edit_dialog_field_error({ min, max })}
              </FieldError>
            )}
            <FieldDescription>
              {m.map_edit_dialog_field_description({ min, max })}
            </FieldDescription>
          </Field>
          <DialogFooter className="sm:flex-col-reverse">
            <DialogClose asChild>
              <Button variant="outline">{m.cancel()}</Button>
            </DialogClose>
            <Button onClick={() => handleConfirm(stallStatus.FREE)}>
              {m.map_edit_dialog_button_clear()}
            </Button>
            <Button onClick={() => handleConfirm(stallStatus.LOCK)}>
              {m.map_edit_dialog_button_lock()}
            </Button>
            <Button onClick={() => handleConfirm(value)} disabled={error}>
              {m.map_edit_dialog_button_status()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EditStallDialogContext.Provider>
  );
}
