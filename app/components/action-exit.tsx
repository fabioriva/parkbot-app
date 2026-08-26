import { useState } from "react"
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
  // FieldGroup,
  FieldLabel,
  // FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useConfirmDialog } from "~/components/confirm-dialog"
import { actionResponse } from "~/lib/action"
import { m } from "@paraglide/messages.js"

export function ActionExit({ exit }) {
  const data = useLoaderData()
  const params = useParams()
  const { showConfirmDialog } = useConfirmDialog()

  const { enable, max, min } = exit
  const [card, setCard] = useState(min)
  const [error, setError] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max)
    const result = schema.safeParse(e.target.value)
    if (!result.success) {
      setError(true)
      setCard(Number(e.target.value))
    } else {
      setError(false)
      setCard(result.data)
    }
  }
  const handleConfirm = async () => {
    showConfirmDialog({
      title: m.exit_call_confirm_dialog_title(),
      description: m.exit_call_confirm_dialog_description({ card }),
      onConfirm: async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/operation/exit`
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ card }),
        })
        actionResponse(res)
      },
    })
  }
  const handleOpen = () => {
    setError(false)
    setCard(min)
  }
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="w-full"
            disabled={!enable.status}
            onClick={handleOpen}
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
          <DialogClose
            render={<Button variant="outline">{m.cancel()}</Button>}
          />

          <DialogClose
            render={
              <Button onClick={handleConfirm} disabled={error}>
                {m.confirm()}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
