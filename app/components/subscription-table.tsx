import { ChevronDown, MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react"
import type { ComponentProps } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { SubscriptionForm } from "~/components/subscription-form"
import { cn } from "~/lib/utils"
import { m } from "@paraglide/messages.js"

type TableSubscription = NonNullable<
  ComponentProps<typeof SubscriptionForm>["selectedSubscription"]
>
interface SubscriptionTableProps {
  aps: ComponentProps<typeof SubscriptionForm>["aps"]
  busy: boolean
  onUpdate: (subscription: TableSubscription) => void
  onDelete: (subscription: TableSubscription) => void
  subscriptions: TableSubscription[]
}

function AssignedSystems({
  namespaces,
  names,
  email,
}: {
  namespaces: string[]
  names: Map<string, string>
  email: string
}) {
  if (!namespaces.length)
    return (
      <span className="text-xs text-muted-foreground">
        {m.subscription_no_systems()}
      </span>
    )
  const remaining = namespaces.length - 3
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-auto max-w-full flex-wrap justify-start gap-1 p-1"
            aria-label={m.subscription_systems_label({
              email,
              count: namespaces.length,
            })}
          >
            {namespaces.slice(0, 3).map((ns, index) => (
              <Badge
                key={`${ns}-${index}`}
                variant="outline"
                className="max-w-32 font-mono font-normal"
              >
                <span className="truncate">{ns}</span>
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="secondary" className="font-normal tabular-nums">
                +{remaining}
              </Badge>
            )}
            <ChevronDown
              className="size-3 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-24px)]">
        <div>
          <PopoverTitle>{m.subscription_assigned_systems()}</PopoverTitle>
          <PopoverDescription className="mt-1 break-all">
            {email}
          </PopoverDescription>
        </div>
        <ul
          className="max-h-64 overflow-y-auto"
          aria-label={m.subscription_assigned_systems()}
        >
          {namespaces.map((ns, index) => (
            <li
              key={`${ns}-${index}`}
              className="border-b py-2 last:border-b-0"
            >
              <p className="text-sm font-medium break-words">
                {names.get(ns) || ns}
              </p>
              {names.get(ns) && (
                <p className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
                  {ns}
                </p>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function SubscriptionTable({
  aps,
  subscriptions,
  busy,
  onUpdate,
  onDelete,
}: SubscriptionTableProps) {
  const sortedSubscriptions = [...subscriptions].sort((a, b) =>
    a.email.localeCompare(b.email)
  )
  const names = new Map(aps.map((item) => [item.ns, item.name]))
  const status = (subscription: TableSubscription) => (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto min-h-5 max-w-full text-center whitespace-normal",
        subscription.subscribed
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "font-normal text-muted-foreground"
      )}
    >
      {subscription.subscribed
        ? m.subscription_registered()
        : m.subscription_pending_registration()}
    </Badge>
  )
  const role = (subscription: TableSubscription) => (
    <Badge variant="secondary" className="font-normal">
      {subscription.role}
    </Badge>
  )
  const actions = (subscription: TableSubscription) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={busy}
            aria-label={m.subscription_menu_label({
              email: subscription.email,
            })}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onUpdate(subscription)
          }}
        >
          <Pencil aria-hidden="true" />
          {m.subscription_action_update()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={busy}
          onClick={() => {
            if (!busy) onDelete(subscription)
          }}
        >
          <Trash2 aria-hidden="true" />
          {m.subscription_action_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <>
      <ul
        className="flex flex-col gap-3 lg:hidden"
        aria-label={m.subscriptions_title()}
      >
        {sortedSubscriptions.map((subscription) => (
          <li
            key={subscription.email}
            className="rounded-xl border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold break-all">
                  {subscription.email}
                </p>
                <p className="mt-1 text-sm break-words text-muted-foreground">
                  {subscription.company}
                </p>
              </div>
              {actions(subscription)}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">
                  {m.subscription_field_role()}
                </dt>
                <dd className="mt-1">{role(subscription)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {m.subscription_column_status()}
                </dt>
                <dd className="mt-1">{status(subscription)}</dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="text-muted-foreground">
                  {m.subscription_column_systems()}
                </dt>
                <dd className="mt-1">
                  <AssignedSystems
                    namespaces={subscription.aps}
                    names={names}
                    email={subscription.email}
                  />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card lg:block">
        <Table>
          <TableCaption className="sr-only">
            {m.subscriptions_title()}
          </TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                Email
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.subscription_field_company()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.subscription_field_role()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.subscription_column_status()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.subscription_column_systems()}
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
            {sortedSubscriptions.map((subscription) => (
              <TableRow key={subscription.email}>
                <TableCell className="max-w-72 py-2 font-semibold break-all whitespace-normal">
                  {subscription.email}
                </TableCell>
                <TableCell className="max-w-40 py-2 break-words whitespace-normal">
                  {subscription.company}
                </TableCell>
                <TableCell className="py-2">{role(subscription)}</TableCell>
                <TableCell className="py-2">{status(subscription)}</TableCell>
                <TableCell className="max-w-md py-2 whitespace-normal">
                  <AssignedSystems
                    namespaces={subscription.aps}
                    names={names}
                    email={subscription.email}
                  />
                </TableCell>
                <TableCell className="py-2 text-right">
                  {actions(subscription)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
