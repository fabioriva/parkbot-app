import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface HistoryItemProps {
  item: any; // item: Log;
}

interface HistoryListProps {
  history: HistoryItemProps[];
}

// utils/pagination.ts
export const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | string)[] => {
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
};

const TablePagination = ({
  currentPage,
  postsPerPage,
  totalPosts,
  paginate,
}) => {
  // const pageNumbers = [];
  // for (let i = 1; i <= Math.ceil(pages); i++) {
  //   pageNumbers.push(i);
  // }
  const pages = Math.ceil(totalPosts / postsPerPage);
  const pageNumbers = getPageNumbers(currentPage, pages);
  // console.log(pageNumbers);
  return (
    <Pagination className="mt-6">
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

export function HistoryTable({ history }: HistoryListProps) {
  // console.log(history);
  const { t } = useTranslation();
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = history.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>{t("aps.history.table.date")}</TableHead>
            <TableHead>{t("aps.history.table.device")}</TableHead>
            <TableHead>{t("aps.history.table.mode")}</TableHead>
            <TableHead>{t("aps.history.table.operation")}</TableHead>
            <TableHead>{t("aps.history.table.alarm")}</TableHead>
            <TableHead>{t("aps.history.table.card")}</TableHead>
            <TableHead>{t("aps.history.table.stall")}</TableHead>
            <TableHead>{t("aps.history.table.size")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPosts.map((item, key) => (
            <TableRow key={key}>
              <TableCell className="font-medium">
                {item.date.slice(0, 10) + " " + item.date.slice(11, 19)}
              </TableCell>
              <TableCell>
                {item.device.id === 0 && t("aps.history.list.operator")}
                {item.device.id !== 0 && item.device.key}
              </TableCell>
              <TableCell>
                {item.mode.id} - {t("aps.mode." + item.mode.key)}
              </TableCell>
              <TableCell>
                {item.alarm !== undefined
                  ? t("aps.alarms." + item.alarm.key, item.alarm.query)
                  : t("aps.history.table." + item.operation.key)}
              </TableCell>
              <TableCell>
                {item.operation.key === "op-alarm-on" && (
                  <span className="text-alert">AL{item.alarm.id}</span>
                )}
                {item.operation.key === "op-alarm-off" && (
                  <span className="text-ready">AL{item.alarm.id}</span>
                )}
              </TableCell>
              <TableCell>{item.card}</TableCell>
              <TableCell>{item.stall}</TableCell>
              <TableCell>{item.size}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        postsPerPage={postsPerPage}
        totalPosts={history.length}
        paginate={paginate}
      />
    </>
  );
}
