import { MoreHorizontalIcon, Trash2 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { UserAvatar } from "~/components/user-avatar"
import type { User } from "~/lib/user.server"
import { cn } from "~/lib/utils"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"

type TableUser = User & { twoFactorEnabled?: boolean }

interface UserTableProps {
  busy: boolean
  onDelete: (user: Pick<User, "name" | "email">) => void
  users: TableUser[]
}

function UserIdentity({ user }: { user: TableUser }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="shrink-0 [&>div]:size-8">
        <UserAvatar user={user} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold break-words">{user.name}</p>
        <p className="mt-0.5 text-xs break-all text-muted-foreground">
          {user.email}
        </p>
      </div>
    </div>
  )
}

function UserRole({ role }: { role: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto min-h-5 max-w-full font-normal break-words whitespace-normal",
        role === "admin" &&
          "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
        role === "service" &&
          "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        role === "valet" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      )}
    >
      {role && role !== "—" ? role : m.users_role_missing()}
    </Badge>
  )
}

function UserStatus({ active, label }: { active: boolean; label: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto min-h-5 max-w-full text-center font-normal whitespace-normal",
        active
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "text-muted-foreground"
      )}
    >
      {label}
    </Badge>
  )
}

function UserDates({
  user,
  formatter,
}: {
  user: TableUser
  formatter: Intl.DateTimeFormat
}) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
      <dt className="text-muted-foreground">{m.users_column_created()}</dt>
      <dd className="min-w-0 tabular-nums">
        <time
          dateTime={user.createdAt.toISOString()}
          title={user.createdAt.toISOString()}
        >
          {formatter.format(user.createdAt)}
        </time>
      </dd>
      <dt className="text-muted-foreground">{m.users_column_updated()}</dt>
      <dd className="min-w-0 tabular-nums">
        <time
          dateTime={user.updatedAt.toISOString()}
          title={user.updatedAt.toISOString()}
        >
          {formatter.format(user.updatedAt)}
        </time>
      </dd>
    </dl>
  )
}

export function UserTable({ busy, onDelete, users }: UserTableProps) {
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  })
  const emailStatus = (user: TableUser) => (
    <UserStatus
      active={user.emailVerified}
      label={
        user.emailVerified
          ? m.users_email_verified()
          : m.users_filter_email_pending()
      }
    />
  )
  const twoFactorStatus = (user: TableUser) => (
    <UserStatus
      active={user.twoFactorEnabled ?? false}
      label={
        user.twoFactorEnabled
          ? m.users_filter_two_factor_enabled()
          : m.users_filter_two_factor_disabled()
      }
    />
  )
  const actions = (user: TableUser) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={busy}
            aria-label={m.users_menu_label({ email: user.email })}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onDelete(user)
          }}
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
          {m.users_action_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <>
      <ul
        className="flex flex-col gap-3 lg:hidden"
        aria-label={m.users_title()}
      >
        {users.map((user) => (
          <li key={user.id} className="rounded-xl border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <UserIdentity user={user} />
              </div>
              {actions(user)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {m.users_filter_role()}
                </dt>
                <dd className="mt-1">
                  <UserRole role={user.role} />
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {m.users_column_system()}
                </dt>
                <dd className="mt-1 font-mono break-all">{user.aps || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {m.users_filter_email()}
                </dt>
                <dd className="mt-1">{emailStatus(user)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {m.users_filter_two_factor()}
                </dt>
                <dd className="mt-1">{twoFactorStatus(user)}</dd>
              </div>
            </dl>
            <div className="mt-3 border-t pt-3">
              <p className="mb-1.5 text-xs text-muted-foreground">
                {m.users_column_dates()}
              </p>
              <UserDates user={user} formatter={dateFormatter} />
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card lg:block">
        <Table>
          <TableCaption className="sr-only">{m.users_title()}</TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.users_column_user()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.users_filter_role()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.users_filter_email()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                2FA
              </TableHead>
              <TableHead
                scope="col"
                className="max-w-36 text-xs whitespace-normal text-muted-foreground"
              >
                {m.users_column_system()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.users_column_dates()}
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="max-w-72 py-2 whitespace-normal">
                  <UserIdentity user={user} />
                </TableCell>
                <TableCell className="max-w-28 py-2">
                  <UserRole role={user.role} />
                </TableCell>
                <TableCell className="max-w-36 py-2">
                  {emailStatus(user)}
                </TableCell>
                <TableCell className="max-w-32 py-2">
                  {twoFactorStatus(user)}
                </TableCell>
                <TableCell className="max-w-36 py-2 font-mono text-xs break-all whitespace-normal">
                  {user.aps || "—"}
                </TableCell>
                <TableCell className="max-w-64 py-2 whitespace-normal">
                  <UserDates user={user} formatter={dateFormatter} />
                </TableCell>
                <TableCell className="py-2 text-right">
                  {actions(user)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
