import { useEffect, useRef } from "react"
import type { FetcherWithComponents } from "react-router"
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
import type { User } from "~/lib/user.server"
import { m } from "@paraglide/messages.js"

interface UserDeleteDialogProps {
  user: Pick<User, "name" | "email">
  fetcher: Pick<
    FetcherWithComponents<{
      action?: string
      success?: string
      error?: string
    }>,
    "Form" | "state" | "data"
  >
  open: boolean
  setOpen: (open: boolean) => void
}

export function UserDeleteDialog({
  user,
  fetcher,
  open,
  setOpen,
}: UserDeleteDialogProps) {
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
          <AlertDialogTitle>{m.users_action_delete()}</AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            {m.users_delete_description({ name: user.name, email: user.email })}
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
          <input type="hidden" name="email" value={user.email} />
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
              {busy ? m.users_deleting() : m.users_action_delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </fetcher.Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
