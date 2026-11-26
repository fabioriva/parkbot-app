import { useEffect, useRef } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Spinner } from "~/components/ui/spinner"
import type {
  SubscriptionMutationFetcher,
  EditableSubscription,
} from "~/components/subscription-form"
import { m } from "@paraglide/messages.js"

interface SubscriptionDeleteDialogProps {
  subscription: Pick<EditableSubscription, "email">
  fetcher: SubscriptionMutationFetcher
  open: boolean
  setOpen: (open: boolean) => void
}

export function SubscriptionDeleteDialog({
  subscription,
  fetcher,
  open,
  setOpen,
}: SubscriptionDeleteDialogProps) {
  const busy = fetcher.state !== "idle"
  const submitted = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !submitted.current || busy) return
    if (fetcher.data?.success) {
      submitted.current = false
      setOpen(false)
    } else if (fetcher.data?.error) {
      submitted.current = false
      errorRef.current?.focus()
    }
  }, [open, busy, fetcher.data, setOpen])
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy && !submitted.current) setOpen(nextOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.subscription_action_delete()}</AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            {m.subscription_delete_description({ email: subscription.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <fetcher.Form
          method="post"
          aria-busy={busy}
          onSubmit={(event) => {
            if (busy || submitted.current) {
              event.preventDefault()
              return
            }
            submitted.current = true
          }}
        >
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="email" value={subscription.email} />
          {!busy && fetcher.data?.error && (
            <Alert
              variant="destructive"
              className="mb-4"
              ref={errorRef}
              tabIndex={-1}
            >
              <AlertDescription>{fetcher.data.error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={busy}>
              {m.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant="destructive"
              disabled={busy}
              aria-busy={busy}
            >
              {busy && (
                <Spinner
                  aria-hidden="true"
                  className="motion-reduce:animate-none"
                />
              )}
              {busy
                ? m.subscription_deleting()
                : m.subscription_action_delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </fetcher.Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
