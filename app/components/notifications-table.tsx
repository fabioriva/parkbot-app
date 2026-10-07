import { MoreHorizontalIcon } from "lucide-react"
import { useState, type ComponentProps } from "react"
import type { FetcherWithComponents } from "react-router"
import { Button } from "~/components/ui/button"
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { NotificationsForm } from "~/components/notifications-form"

import { m } from "@paraglide/messages.js"

type NotificationRecipient = NonNullable<
  ComponentProps<typeof NotificationsForm>["selectedRecipient"]
>

interface NotificationsTableProps {
  fetcher: Pick<FetcherWithComponents<unknown>, "Form" | "state" | "submit">
  recipients: NotificationRecipient[]
}

export function NotificationsTable({
  fetcher,
  recipients,
}: NotificationsTableProps) {
  const [open, setOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] =
    useState<NotificationRecipient>()

  const handleDelete = async (
    recipient: Pick<NotificationRecipient, "_id">
  ) => {
    fetcher.submit({ action: "delete", _id: recipient._id }, { method: "post" })
  }
  const handleUpdate = async (recipient: NotificationRecipient) => {
    setOpen(true)
    setSelectedRecipient(recipient)
  }
  return (
    <>
      <NotificationsForm
        action="update"
        fetcher={fetcher}
        open={open}
        setOpen={setOpen}
        selectedRecipient={selectedRecipient}
      />
      {recipients.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>{m.notifications_field_name()}</TableHead>
              <TableHead>{m.notifications_field_locale()}</TableHead>
              <TableHead>{m.notifications_field_phone()}</TableHead>
              <TableHead className="text-right">{m.actions()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient._id}>
                <TableCell className="font-semibold">
                  {recipient.email}
                </TableCell>
                <TableCell>{recipient.name || "-"}</TableCell>
                <TableCell className="uppercase">
                  {recipient.locale || "en"}
                </TableCell>
                <TableCell>{recipient.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-6">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdate(recipient)}>
                        {m.notifications_action_update()}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(recipient)}
                        variant="destructive"
                      >
                        {m.notifications_action_delete()}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-4 text-center">{m.notifications_empty()}</div>
      )}
    </>
  )
}
