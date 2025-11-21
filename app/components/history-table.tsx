import { useTranslation } from "react-i18next";
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
  // item: Log;
  item: any;
}

interface HistoryListProps {
  history: HistoryItemProps[];
}

export function HistoryTable({ history }: HistoryListProps) {
  // console.log(history);
  const { t } = useTranslation();
  return (
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
        {history.map((item, key) => (
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
              {item.alarm !== undefined && `AL${item.alarm.id}`}
            </TableCell>
            <TableCell>{item.card}</TableCell>
            <TableCell>{item.stall}</TableCell>
            <TableCell>{item.size}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
