import { useId, useState } from "react"
import { useLoaderData, useParams } from "react-router"
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
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useConfirmDialog } from "~/components/confirm-dialog"
import { actionResponse } from "~/lib/action"
import { m } from "@paraglide/messages.js"

interface ActionRollbackProps {
  disabled?: boolean
  card: number
  action: {
    key: "action-rollback"
    enable: { status: boolean | 0 | 1 }
    entry: number
    min: number
    max: number
  }
}

export function ActionRollback({
  action,
  card: deviceCard,
  disabled = false,
}: ActionRollbackProps) {
  const data = useLoaderData<{ token: string | null }>()
  const params = useParams()
  const { showConfirmDialog } = useConfirmDialog()
  const cardId = useId()
  const { enable, entry, min, max } = action
  const [card, setCard] = useState(String(deviceCard))
  const result = z.coerce.number().int().min(min).max(max).safeParse(card)
  const error = card.trim() === "" || !result.success

  const handleConfirm = () => {
    if (disabled || error || !result.success || !enable.status) return
    const cardNumber = result.data
    showConfirmDialog({
      title: m.rollback_call_confirm_dialog_title(),
      description: m.rollback_call_confirm_dialog_description({
        entry,
        card: cardNumber,
      }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/operation/rollback`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entry, card: cardNumber }),
        })
        await actionResponse(res)
      },
    })
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setCard(String(deviceCard))
      }}
    >
      <DialogTrigger
        render={
          <Button className="w-full" disabled={disabled || !enable.status}>
            {m.rollback_call()}
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{m.rollback_call_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.rollback_call_dialog_description({ entry })}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={cardId}>
            {m.rollback_call_dialog_field_label()}
          </FieldLabel>
          <Input
            id={cardId}
            min={min}
            max={max}
            step={1}
            name="card"
            type="number"
            value={card}
            aria-invalid={error}
            readOnly
          />
          <FieldDescription>
            {m.rollback_call_dialog_field_description({ min, max })}
          </FieldDescription>
          {error && (
            <FieldError>{m.rollback_call_dialog_field_error()}</FieldError>
          )}
        </Field>
        <DialogFooter>
          <DialogClose
            render={<Button variant="outline">{m.cancel()}</Button>}
          />
          <DialogClose
            render={
              <Button
                onClick={handleConfirm}
                disabled={disabled || error || !enable.status}
              >
                {m.confirm()}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
