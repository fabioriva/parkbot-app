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
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Field, FieldLabel } from "~/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

// utils/pagination.ts
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  delta: number = 2,
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
  const { t } = useTranslation();
  const { alarm, device, operation } = item;
  return (
    <>
      {alarm !== undefined ? (
        <Badge
          className={clsx({
            "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
              operation.id === 1,
            "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300":
              operation.id === 2,
          })}
          variant="outline"
        >
          {operation.id === 1 && <BadgeAlert data-icon="inline-start" />}
          {operation.id === 2 && <BadgeCheck data-icon="inline-start" />}
          <span>AL{alarm.id}</span>
          {t("alarms." + alarm.key, alarm.query)}
        </Badge>
      ) : (
        <Badge
          className={clsx("text-muted-foreground", {
            "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300":
              operation.id === 3,
          })}
          variant="outline"
        >
          {device.id === 0 ? (
            <>
              <User data-icon="inline-start" />
              {t("history.table." + operation.key)}
            </>
          ) : (
            <>
              {operation.id === 3 && <Wrench data-icon="inline-start" />}
              {operation.id === 4 && <Tag data-icon="inline-start" />}
              {operation.id === 5 && <ArrowRight data-icon="inline-start" />}
              {operation.id === 6 && <ArrowLeft data-icon="inline-start" />}
              {operation.id === 7 && <ArrowRight data-icon="inline-start" />}
              {operation.id === 8 && <ArrowLeft data-icon="inline-start" />}
              {t("history.table." + operation.key)}
            </>
          )}
        </Badge>
      )}
    </>
  );
};

const TablePagination = ({ currentPage, rowsPerPage, totalRows, paginate }) => {
  // const pageNumbers = [];
  // for (let i = 1; i <= Math.ceil(pages); i++) {
  //   pageNumbers.push(i);
  // }
  const pages = Math.ceil(totalRows / rowsPerPage);
  const pageNumbers = getPageNumbers(currentPage, pages);
  // console.log(pageNumbers);
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={
              currentPage <= 1 ? "pointer-events-none cursor-not-allowed" : ""
            }
            onClick={() => paginate(currentPage - 1)}
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
                  className={number === currentPage ? "bg-muted" : ""}
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
                : ""
            }
            onClick={() => paginate(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export function HistoryTable({ history: { count, dateFrom, dateTo }, query }) {
  const { t } = useTranslation();
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPages] = useState(15);
  const indexOfLastPost = currentPage * rowsPerPage;
  const indexOfFirstPost = indexOfLastPost - rowsPerPage;
  const currentRows = query.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <>
      <Table className="border border-muted">
        {/* <TableCaption>
          {t("history.description", { from: dateFrom, to: dateTo, count })}
        </TableCaption> */}
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>{t("history.table.date")}</TableHead>
            <TableHead>{t("history.table.device")}</TableHead>
            <TableHead>{t("history.table.mode")}</TableHead>
            <TableHead className="pl-3">
              {t("history.table.operation")}
            </TableHead>
            <TableHead>{t("history.table.card")}</TableHead>
            <TableHead>{t("history.table.stall")}</TableHead>
            <TableHead>{t("history.table.size")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRows.map((item, key) => (
            <TableRow key={key}>
              <TableCell>
                {item.date.slice(0, 10) + " " + item.date.slice(11, 19)}
              </TableCell>
              <TableCell>
                {item.device.id === 0 && t("history.log.operator")}
                {item.device.id !== 0 && item.device.key}
              </TableCell>
              <TableCell>
                {item.mode.id} - {t("mode." + item.mode.key)}
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
      <div className="flex items-center gap-3 pl-1.5 pt-3">
        <div className="grow-1">
          {t("history.description", { from: dateFrom, to: dateTo, count })}
        </div>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            className="grow-0"
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
        </Field>
        <div className="w-fit">
          <TablePagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalRows={query.length}
            paginate={paginate}
          />
        </div>
      </div>
    </>
  );
}
