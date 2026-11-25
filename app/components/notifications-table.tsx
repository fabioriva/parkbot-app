import { Mail, MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { NotificationRecipient } from "~/components/notifications-form"
import { m } from "@paraglide/messages.js"

interface NotificationsTableProps {
  recipients: NotificationRecipient[]
  busy: boolean
  onUpdate: (recipient: NotificationRecipient) => void
  onDelete: (recipient: NotificationRecipient) => void
}

export function NotificationsTable({
  recipients,
  busy,
  onUpdate,
  onDelete,
}: NotificationsTableProps) {
  const language = (recipient: NotificationRecipient) => (
    <Badge variant="secondary" className="font-normal uppercase">
      {recipient.locale || "en"}
    </Badge>
  )
  const actions = (recipient: NotificationRecipient) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={busy}
            aria-label={m.notifications_menu_label({ email: recipient.email })}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onUpdate(recipient)
          }}
        >
          <Pencil aria-hidden="true" />
          {m.notifications_action_update()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onDelete(recipient)
          }}
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
          {m.notifications_action_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  if (!recipients.length)
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center"
      >
        <Mail className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="max-w-sm text-sm text-muted-foreground">
          {m.notifications_empty()}
        </p>
      </div>
    )
  return (
    <>
      <ul
        className="flex flex-col gap-3 lg:hidden"
        aria-label={m.notifications_title()}
      >
        {recipients.map((recipient) => (
          <li key={recipient._id} className="rounded-xl border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold break-all">
                  {recipient.email}
                </p>
                <p className="mt-1 text-sm break-words text-muted-foreground">
                  {recipient.name || "—"}
                </p>
              </div>
              {actions(recipient)}
            </div>
            <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <dt className="text-muted-foreground">
                  {m.notifications_column_locale()}
                </dt>
                <dd>{language(recipient)}</dd>
              </div>
              <div className="flex min-w-0 items-baseline gap-2">
                <dt className="text-muted-foreground">
                  {m.notifications_column_phone()}
                </dt>
                <dd className="font-mono break-all tabular-nums">
                  {recipient.phone || "—"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card lg:block">
        <Table>
          <TableCaption className="sr-only">
            {m.notifications_title()}
          </TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                Email
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.notifications_column_name()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.notifications_column_locale()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.notifications_column_phone()}
              </TableHead>
              <TableHead
                scope="col"
                className="w-12 text-right text-xs text-muted-foreground"
              >
                {m.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient._id}>
                <TableCell className="max-w-xs py-2 font-semibold break-all whitespace-normal">
                  {recipient.email}
                </TableCell>
                <TableCell className="max-w-xs py-2 break-words whitespace-normal">
                  {recipient.name || "—"}
                </TableCell>
                <TableCell className="py-2">{language(recipient)}</TableCell>
                <TableCell className="py-2 font-mono text-xs tabular-nums">
                  {recipient.phone || "—"}
                </TableCell>
                <TableCell className="py-2 text-right">
                  {actions(recipient)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
