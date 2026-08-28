import clsx from "clsx"
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  ChevronFirst,
  ChevronLast,
  CircleSmall,
  Key,
  Tag,
  User,
  Wrench,
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination"
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { safeMessageT } from "~/lib/trans"
import { m } from "@paraglide/messages.js"

// utils/pagination.ts
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = 1
): (number | string)[] {
  const range: (number | string)[] = []
  const left = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  range.push(1)
  if (left > 2) range.push("...")

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < totalPages - 1) range.push("...")
  if (totalPages > 1) range.push(totalPages)

  return range
}

const TablePagination = ({ currentPage, pages, paginate }) => {
  const pageNumbers = getPageNumbers(currentPage, pages)
  return (
    <Pagination className="flex">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            className={
              currentPage <= 1
                ? "pointer-events-none cursor-not-allowed"
                : undefined
            }
            onClick={() => paginate(1)}
          >
            <ChevronFirst />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={
              currentPage <= 1
                ? "pointer-events-none cursor-not-allowed"
                : undefined
            }
            onClick={() => paginate(currentPage - 1)}
            text={m.history_pagination_previous()}
          />
        </PaginationItem>
        {/* {pageNumbers.map((number, key) => {
          if (number === "...") {
            return (
              <PaginationItem key={key}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          } else {
            return (
              <PaginationItem key={key}>
                <PaginationLink
                  href="#"
                  isActive={number === currentPage}
                  onClick={() => paginate(number)}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            )
          }
        })} */}
        <PaginationItem>
          <PaginationNext
            href="#"
            className={
              currentPage >= pages
                ? "pointer-events-none cursor-not-allowed"
                : undefined
            }
            onClick={() => paginate(currentPage + 1)}
            text={m.history_pagination_next()}
          />
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            className={
              currentPage >= pages
                ? "pointer-events-none cursor-not-allowed"
                : undefined
            }
            onClick={() => paginate(pages)}
          >
            <ChevronLast />
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
  rowsPerPage,
}) {
  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table className="">
          {/* <TableCaption>
            {m.history_description({
              from: dateFrom,
              to: dateTo,
              count,
            })}
          </TableCaption> */}
          <TableHeader>
            <TableRow className="rounded-lg">
              <TableHead>{m.history_table_head_date()}</TableHead>
              <TableHead>{m.history_table_head_device()}</TableHead>
              <TableHead>{m.history_table_head_mode()}</TableHead>
              <TableHead className="pl-3">
                {m.history_table_head_operation()}
              </TableHead>
              <TableHead>{m.history_table_head_card()}</TableHead>
              <TableHead>{m.history_table_head_stall()}</TableHead>
              <TableHead>{m.history_table_head_size()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.map((item, key) => (
              <TableRow key={key}>
                <TableCell>
                  {item.date.slice(0, 10) + " " + item.date.slice(11, 19)}
                </TableCell>
                <TableCell>
                  {item.device.id === 0 && !item.user
                    ? m.operator()
                    : item.user}
                  {item.device.id !== 0 && item.device.key}
                </TableCell>
                <TableCell>
                  {item.device.id !== 0 ? (
                    <span>{safeMessageT("mode", item.mode.key)}</span>
                  ) : (
                    <span className="text-muted-foreground">No mode</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.alarm !== undefined ? (
                    <Badge variant="outline">
                      {item.operation?.id === 1 && (
                        <CircleSmall
                          className="fill-red-500 stroke-red-500"
                          data-icon="inline-start"
                        />
                      )}
                      {item.operation?.id === 2 && (
                        <CircleSmall
                          className="fill-green-500 stroke-green-500"
                          data-icon="inline-start"
                        />
                      )}
                      <span>AL{item.alarm.id}</span>
                      {safeMessageT("alarm", item.alarm.key, item.alarm.query)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
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
                        data-icon="inline-start"
                      />
                      {safeMessageT("history_table", item.operation.key)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{item.card}</TableCell>
                <TableCell>{item.stall}</TableCell>
                <TableCell>{item.size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between pl-2">
        <p className="text-sm text-muted-foreground">
          {m.history_pagination_current_page({
            current: currentPage,
            total: pages,
          })}
        </p>
        <div>
          <TablePagination
            currentPage={currentPage}
            pages={pages}
            paginate={paginate}
          />
        </div>
      </div>
    </>
  )
}
