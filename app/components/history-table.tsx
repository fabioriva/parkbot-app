import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  Tag,
  User,
  Wrench,
} from "lucide-react";
// import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
// import { Field, FieldLabel } from "~/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "~/components/ui/select";
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { safeMessageT } from "~/lib/trans";
import { m } from "@paraglide/messages.js";

// utils/pagination.ts
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = 1,
): (number | string)[] {
  const range: (number | string)[] = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);
  if (left > 2) range.push("...");

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

const Operation = ({ item }) => {
  const { alarm, device, operation } = item;
  return (
    <>
      {alarm !== undefined ? (
        <Badge
          className={clsx({
            "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
              operation?.id === 1,
            "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300":
              operation?.id === 2,
          })}
          variant="outline"
        >
          {operation?.id === 1 && <BadgeAlert data-icon="inline-start" />}
          {operation?.id === 2 && <BadgeCheck data-icon="inline-start" />}
          <span>AL{alarm.id}</span>
          {safeMessageT("alarm", alarm.key, alarm.query)}
        </Badge>
      ) : (
        <Badge
          className={clsx("text-muted-foreground", {
            "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300":
              operation?.id === 3,
          })}
          variant="outline"
        >
          {device.id === 0 ? (
            <>
              <User data-icon="inline-start" />
              {safeMessageT("history_table", operation.key)}
            </>
          ) : (
            <>
              {operation?.id === 3 && <Wrench data-icon="inline-start" />}
              {operation?.id === 4 && <Tag data-icon="inline-start" />}
              {operation?.id === 5 && <ArrowRight data-icon="inline-start" />}
              {operation?.id === 6 && <ArrowLeft data-icon="inline-start" />}
              {operation?.id === 7 && <ArrowRight data-icon="inline-start" />}
              {operation?.id === 8 && <ArrowLeft data-icon="inline-start" />}
              {safeMessageT("history_table", operation?.key)}
            </>
          )}
        </Badge>
      )}
    </>
  );
};

const TablePagination = ({ currentPage, pages, paginate }) => {
  const pageNumbers = getPageNumbers(currentPage, pages);
  return (
    <Pagination>
      <PaginationContent>
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
        {pageNumbers.map((number, key) => {
          if (number === "...") {
            return (
              <PaginationItem key={key}>
                <PaginationEllipsis />
              </PaginationItem>
            );
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
            );
          }
        })}
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
      </PaginationContent>
    </Pagination>
  );
};

// export function HistoryTable({ history: { count, dateFrom, dateTo }, query }) {
export function HistoryTable({
  currentPage,
  pages,
  paginate,
  query,
  rowsPerPage,
}) {
  // pagination
  // const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage, setRowsPerPages] = useState(15);
  // const indexOfLastPost = currentPage * rowsPerPage;
  // const indexOfFirstPost = indexOfLastPost - rowsPerPage;
  // const currentRows = query.slice(indexOfFirstPost, indexOfLastPost);
  // const pages = Math.ceil(query.length / rowsPerPage);
  // const paginate = (pageNumber) => setCurrentPage(pageNumber);
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
            {/* {currentRows.map((item, key) => ( */}
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
                  {item.device.id !== 0 && (
                    <>
                      [<span className="font-mono">{item.mode.id}</span>]{" "}
                      {safeMessageT("mode", item.mode.key)}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <Operation item={item} />
                </TableCell>
                <TableCell>{item.card}</TableCell>
                <TableCell>{item.stall}</TableCell>
                <TableCell>{item.size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-6 py-6">
        <div className="grow text-muted-foreground" />
        {/* <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">
            {m.history_pagination_rows_per_page()}
          </FieldLabel>
          <Select
            defaultValue={rowsPerPage}
            onValueChange={(rows) => setRowsPerPages(rows)}
          >
            <SelectTrigger className="grow-0">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rows per page</SelectLabel>
                <SelectItem value={15}>15</SelectItem>
                <SelectItem value={30}>30</SelectItem>
                <SelectItem value={50}>50</SelectItem>
                <SelectItem value={100}>100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field> */}
        <p className="text-sm">
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
  );
}
