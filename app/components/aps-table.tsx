import { MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react"
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { EditableAps } from "~/components/aps-form"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"

type TableAps = EditableAps
interface ApsTableProps {
  aps: TableAps[]
  busy: boolean
  onUpdate: (aps: TableAps) => void
  onDelete: (aps: TableAps) => void
}

export function ApsTable({ aps, busy, onUpdate, onDelete }: ApsTableProps) {
  const sortedAps = [...aps].sort((a, b) => a.ns.localeCompare(b.ns))
  const numberFormat = new Intl.NumberFormat(getLocale())
  const notifications = (item: TableAps) => (
    <Badge
      variant="secondary"
      className={
        item.notifications
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "font-normal text-muted-foreground"
      }
    >
      {item.notifications
        ? m.aps_notifications_enabled()
        : m.aps_notifications_disabled()}
    </Badge>
  )
  const actions = (item: TableAps) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={busy}
            aria-label={m.aps_menu_label({ name: item.name, ns: item.ns })}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onUpdate(item)
          }}
        >
          <Pencil aria-hidden="true" />
          {m.aps_action_update()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onClick={() => {
            if (!busy) onDelete(item)
          }}
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
          {m.aps_action_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  return (
    <>
      <ul className="flex flex-col gap-3 lg:hidden" aria-label={m.aps_title()}>
        {sortedAps.map((item) => (
          <li key={item.ns} className="rounded-xl border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold break-words">{item.name}</p>
                <p className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
                  <span className="sr-only">{m.aps_field_ns()}: </span>
                  {item.ns}
                </p>
              </div>
              {actions(item)}
            </div>
            <p className="mt-2 text-sm break-words text-muted-foreground">
              <span className="sr-only">{m.aps_column_location()}: </span>
              {item.city} · {item.country} {item.flag}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="min-w-0">
                <dt className="text-muted-foreground">
                  {m.aps_field_company()}
                </dt>
                <dd className="mt-1 break-words">{item.company}</dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground">
                  {m.aps_field_parking_spaces()}
                </dt>
                <dd className="mt-1 font-mono font-semibold tabular-nums">
                  {numberFormat.format(item.parkingSpaces)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">
                  {m.aps_column_time_zone()}
                </dt>
                <dd className="mt-1 font-mono break-all">
                  {item.timeZone || "—"}
                </dd>
              </div>
              <div className="col-span-2 flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">
                  {m.aps_column_notifications()}
                </dt>
                <dd>{notifications(item)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card lg:block">
        <Table>
          <TableCaption className="sr-only">{m.aps_title()}</TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.aps_field_name()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.aps_field_company()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.aps_column_location()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.aps_column_time_zone()}
              </TableHead>
              <TableHead
                scope="col"
                className="text-right text-xs text-muted-foreground"
              >
                {m.aps_field_parking_spaces()}
              </TableHead>
              <TableHead scope="col" className="text-xs text-muted-foreground">
                {m.aps_column_notifications()}
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
            {sortedAps.map((item) => (
              <TableRow key={item.ns}>
                <TableCell className="max-w-56 py-2 whitespace-normal">
                  <p className="font-semibold break-words">{item.name}</p>
                  <p className="mt-0.5 font-mono text-xs break-all text-muted-foreground">
                    <span className="sr-only">{m.aps_field_ns()}: </span>
                    {item.ns}
                  </p>
                </TableCell>
                <TableCell className="max-w-40 py-2 break-words whitespace-normal">
                  {item.company}
                </TableCell>
                <TableCell className="max-w-48 py-2 whitespace-normal">
                  <p className="break-words">{item.city}</p>
                  <p className="mt-0.5 text-xs break-words text-muted-foreground">
                    {item.country} {item.flag}
                  </p>
                </TableCell>
                <TableCell className="max-w-44 py-2 font-mono text-xs break-all whitespace-normal">
                  {item.timeZone || "—"}
                </TableCell>
                <TableCell className="py-2 text-right font-mono tabular-nums">
                  {numberFormat.format(item.parkingSpaces)}
                </TableCell>
                <TableCell className="py-2">{notifications(item)}</TableCell>
                <TableCell className="py-2 text-right">
                  {actions(item)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
