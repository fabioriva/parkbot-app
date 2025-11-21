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
  TableCaption,
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

const TablePagination = ({
  currentPage,
  postsPerPage,
  totalPosts,
  paginate,
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }
  // console.log(totalPosts, pageNumbers, pageNumbers.length);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={
              currentPage <= 1
                ? "pointer-events-none cursor-not-allowed text-muted"
                : ""
            }
            onClick={() => paginate(currentPage - 1)}
          />
        </PaginationItem>
        <PaginationItem>
          {pageNumbers.map((number) => (
            <PaginationLink href="#" onClick={() => paginate(number)}>
              {number}
            </PaginationLink>
          ))}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            className={
              currentPage >= pageNumbers.length
                ? "pointer-events-none cursor-not-allowed text-muted"
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
  const postsPerPage = 10;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = history.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
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
                {item.mode.id} {t("aps.history.table." + item.mode.key)}
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
