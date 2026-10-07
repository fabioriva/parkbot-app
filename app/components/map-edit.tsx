"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldDescription,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { m } from "@paraglide/messages.js"

interface EditStallDialogOptions {
  definitions: {
    cards: number
    minCard?: number
    maxCard?: number
    stallStatus: {
      FREE: number
      LOCK: number
    }
  }
  stall: {
    nr: string | number
    status: number
  }
  onConfirm?: (status: number) => void | Promise<void>
}

interface EditStallDialogContextValue {
  showEditDialog: (options: EditStallDialogOptions) => void
}

const EditStallDialogContext =
  createContext<EditStallDialogContextValue | null>(null)

export const useEditStallDialog = () => {
  const context = useContext(EditStallDialogContext)
  if (!context) {
    throw new Error("useEditDialog must be used within EditDialogProvider")
  }
  return context
}

export function EditStallDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<EditStallDialogOptions | null>(null)
  const showEditDialog = (opts: EditStallDialogOptions) => {
    setOptions(opts)
    setOpen(true)
    setValue(opts.stall.status)
  }
  const min = options?.definitions.minCard ?? 1
  const max = options?.definitions.maxCard ?? options?.definitions.cards ?? 1
  const [error, setError] = useState(false)
  const [value, setValue] = useState(0)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max)
    const result = schema.safeParse(e.target.value)
    if (!result.success) {
      setError(true)
      setValue(Number(e.target.value))
    } else {
      setError(false)
      setValue(result.data)
    }
  }
  const handleConfirm = (status: number) => {
    setOpen(false)
    options?.onConfirm?.(status)
  }

  return (
    <EditStallDialogContext.Provider value={{ showEditDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        {options && (
          <DialogContent className="sm:max-w-sm" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>
                {m.map_edit_dialog_title({ nr: options.stall.nr })}
              </DialogTitle>
              <DialogDescription>
                {m.map_edit_dialog_description({ nr: options.stall.nr })}
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
              <DialogClose
                render={<Button variant="outline">{m.cancel()}</Button>}
              />
              <Button
                onClick={() =>
                  handleConfirm(options.definitions.stallStatus.FREE)
                }
              >
                {m.map_edit_dialog_button_clear()}
              </Button>
              <Button
                onClick={() =>
                  handleConfirm(options.definitions.stallStatus.LOCK)
                }
              >
                {m.map_edit_dialog_button_lock()}
              </Button>
              <Button onClick={() => handleConfirm(value)} disabled={error}>
                {m.map_edit_dialog_button_status()}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </EditStallDialogContext.Provider>
  )
}
