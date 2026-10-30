import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleSmall,
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { formatPlantDateTime } from "~/lib/date-time"
import { usePlantTimeZone } from "~/hooks/use-plant-time-zone"
import { safeMessageT } from "~/lib/trans"
import { m } from "@paraglide/messages.js"
import { clsx } from "cn"
import type { HistoryEntry } from "~/routes/aps/history"
import "./history-table.css"

interface TablePaginationProps {
  currentPage: number
  pages: number
  paginate: (page: number) => void | Promise<void>
}

interface HistoryTableProps extends TablePaginationProps {
  query: HistoryEntry[]
  rowsPerPage: number
}

function TablePagination({
  currentPage,
  pages,
  paginate,
}: TablePaginationProps) {
  const atStart = currentPage <= 1 || pages <= 1
  const atEnd = currentPage >= pages || pages <= 1

  return (
    <Pagination
      className="history-table-pagination"
      aria-label={m.history_pagination_label()}
    >
      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={atStart}
            aria-label={m.history_pagination_first()}
            onClick={() => paginate(1)}
          >
            <ChevronFirst aria-hidden="true" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            disabled={atStart}
            onClick={() => paginate(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            {m.history_pagination_previous()}
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            disabled={atEnd}
            onClick={() => paginate(currentPage + 1)}
          >
            {m.history_pagination_next()}
            <ChevronRight aria-hidden="true" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={atEnd}
            aria-label={m.history_pagination_last()}
            onClick={() => paginate(pages)}
          >
            <ChevronLast aria-hidden="true" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function HistoryTable({
  currentPage,
  pages,
  paginate,
  query,
}: HistoryTableProps) {
  const timeZone = usePlantTimeZone()
  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table className="history-table">
          <TableCaption className="sr-only">{m.history_title()}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{m.history_table_head_date()}</TableHead>
              <TableHead scope="col">{m.history_table_head_device()}</TableHead>
              <TableHead scope="col">{m.history_table_head_mode()}</TableHead>
              <TableHead scope="col">
                {m.history_table_head_operation()}
              </TableHead>
              <TableHead scope="col" className="history-table-number">
                {m.history_table_head_card()}
              </TableHead>
              <TableHead scope="col" className="history-table-number">
                {m.history_table_head_stall()}
              </TableHead>
              <TableHead scope="col" className="history-table-number">
                {m.history_table_head_size()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.map((item, key) => (
              <TableRow key={key}>
                <TableCell className="history-table-date-cell">
                  <div className="history-table-timestamp">
                    <time dateTime={item.date} className="history-table-time">
                      {timeZone
                        ? formatPlantDateTime(item.date, timeZone, "HH:mm:ss")
                        : "—"}
                      {timeZone && (
                        <span className="history-table-offset">
                          {formatPlantDateTime(item.date, timeZone, "xxx")}
                        </span>
                      )}
                    </time>
                    <span className="history-table-date">
                      {timeZone
                        ? formatPlantDateTime(item.date, timeZone, "dd/MM/yyyy")
                        : "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="history-table-device">
                  {item.device.id === 0 && !item.user
                    ? m.operator()
                    : item.user}
                  {item.device.id !== 0 && item.device.key}
                </TableCell>
                <TableCell className="history-table-mode">
                  {item.device.id !== 0
                    ? safeMessageT("mode", item.mode.key)
                    : "—"}
                </TableCell>
                <TableCell className="history-table-operation">
                  {item.alarm !== undefined ? (
                    <Badge variant="outline" className="history-table-event">
                      {item.operation?.id === 1 && (
                        <CircleSmall
                          className="fill-red-500 stroke-red-500"
                          aria-hidden="true"
                        />
                      )}
                      {item.operation?.id === 2 && (
                        <CircleSmall
                          className="fill-green-500 stroke-green-500"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        <span className="font-mono font-medium">
                          AL{item.alarm.id}
                        </span>{" "}
                        {safeMessageT(
                          "alarm",
                          item.alarm.key,
                          item.alarm.query
                        )}
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="history-table-event">
                      <CircleSmall
                        className={clsx({
                          "fill-amber-500 stroke-amber-500": [3, 4].includes(
                            item.operation?.id
                          ),
                          "fill-blue-500 stroke-blue-500": [
                            5, 6, 7, 8,
                          ].includes(item.operation?.id),
                          "fill-neutral-500 stroke-neutral-500": ![
                            3, 4, 5, 6, 7, 8,
                          ].includes(item.operation?.id),
                        })}
                        aria-hidden="true"
                      />
                      <span>
                        {safeMessageT("history_table", item.operation?.key)}
                      </span>
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="history-table-number">
                  {item.card}
                </TableCell>
                <TableCell className="history-table-number">
                  {item.stall}
                </TableCell>
                <TableCell className="history-table-number">
                  {item.size}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="history-table-footer">
        <p className="text-xs text-muted-foreground tabular-nums">
          {m.history_pagination_current_page({
            current: currentPage,
            total: pages,
          })}
        </p>
        <TablePagination
          currentPage={currentPage}
          pages={pages}
          paginate={paginate}
        />
      </div>
    </>
  )
}
