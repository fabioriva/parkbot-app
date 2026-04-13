"use client";

import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
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

const EditStallDialogContext = createContext();

export const useEditStallDialog = () => {
  const context = useContext(EditStallDialogContext);
  if (!context) {
    throw new Error("useEditDialog must be used within EditDialogProvider");
  }
  return context;
};

export function EditStallDialogProvider({ children }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});
  const showEditDialog = (opts) => {
    console.log(opts);
    setOptions(opts);
    setOpen(true);
    setValue(opts.stall.status);
  };
  const min = 1;
  const max = options?.definitions?.cards || 1;
  const stall = options?.stall;
  const stallStatus = options?.definitions?.stallStatus
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
    console.log(status);
    setOpen(false);
    options?.onConfirm?.(status);
  };
  
  return (
    <EditStallDialogContext.Provider value={{ showEditDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change stall status</DialogTitle>
            <DialogDescription>
              Change the status for stall nr {stall?.nr}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="value">Tag number</FieldLabel>
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
                {t("exit-call.fieldError", {
                  min: min,
                  max: max,
                })}
              </FieldError>
            )}
            <FieldDescription>
              {t("exit-call.fieldDescription", {
                min: min,
                max: max,
              })}
            </FieldDescription>
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {/* <DialogClose asChild>
              <Button
                onClick={() => handleConfirm(value)}
                disabled={error}
              >
                Confirm
              </Button>
            </DialogClose> */}
            <Button onClick={() => handleConfirm(stallStatus.FREE)}>
              Clear
            </Button>
            <Button onClick={() => handleConfirm(stallStatus.LOCK)}>
              Lock
            </Button>
            <Button onClick={() => handleConfirm(value)} disabled={error}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EditStallDialogContext.Provider>
  );
}
