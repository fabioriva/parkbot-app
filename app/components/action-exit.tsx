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
  FieldError,
  FieldDescription,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useConfirmDialog } from "~/components/confirm-dialog"
import { actionResponse } from "~/lib/action"
import { m } from "@paraglide/messages.js"
import type { loader } from "~/routes/aps/dashboard"

interface ActionExitProps {
  disabled?: boolean
  exit: {
    enable: { status: boolean | 0 | 1 }
    max: number
    min: number
  }
}

export function ActionExit({ exit, disabled = false }: ActionExitProps) {
  const data = useLoaderData<typeof loader>()
  const params = useParams()
  const { showConfirmDialog } = useConfirmDialog()
  const cardId = useId()

  const { enable, max, min } = exit
  const [card, setCard] = useState(String(min))
  const result = z.coerce.number().int().min(min).max(max).safeParse(card)
  const error = card.trim() === "" || !result.success

  const handleConfirm = () => {
    if (disabled || error || !result.success || !enable.status) return
    const cardNumber = result.data
    showConfirmDialog({
      title: m.exit_call_confirm_dialog_title(),
      description: m.exit_call_confirm_dialog_description({ card: cardNumber }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/operation/exit`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ card: cardNumber }),
        })
        await actionResponse(res)
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="w-full"
            disabled={disabled || !enable.status}
            onClick={() => setCard(String(min))}
          >
            {m.exit_call()}
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{m.exit_call_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.exit_call_dialog_description({ card })}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={cardId}>
            {m.exit_call_dialog_field_label({ min, max })}
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
            onChange={(event) => setCard(event.target.value)}
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
