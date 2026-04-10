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

const EditDialogContext = createContext();

export const useEditDialog = () => {
  const context = useContext(EditDialogContext);
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
    setOptions(opts);
    setOpen(true);
    setValue(opts.value);
    console.log(opts);
  };
  const [error, setError] = useState(false);
  const [value, setValue] = useState(options?.value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(options.min).max(options.max);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
      setValue(Number(e.target.value));
    } else {
      setError(false);
      setValue(result.data);
    }
  };

  return (
    <EditDialogContext.Provider value={{ showEditDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {options?.title || "Are you absolutely sure?"}
            </DialogTitle>
            <DialogDescription>{options?.description}</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="card">{options?.label}</FieldLabel>
            <Input
              id="value"
              min={options?.min}
              max={options?.max}
              name="value"
              type="number"
              value={value}
              // onChange={options?.onChange}
              onChange={handleChange}
            />
            {error && (
              <FieldError>
                {t("exit-call.fieldError", {
                  min: options?.min,
                  max: options?.max,
                })}
              </FieldError>
            )}
            <FieldDescription>
              {t("exit-call.fieldDescription", {
                min: options?.min,
                max: options?.max,
              })}
            </FieldDescription>
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  setOpen(false);
                  options?.onConfirm?.(value);
                }}
                disabled={error}
              >
                Confirm
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EditDialogContext.Provider>
  );
}
