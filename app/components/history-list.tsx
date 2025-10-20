import clsx from "clsx";
import {
  ArrowLeftRight,
  ArrowRightLeft,
  Bell,
  BellOff,
  Bookmark,
  IdCard,
  UserRoundCog,
  UserRoundPlus,
  UserRoundMinus,
  X,
} from "lucide-react";

interface HistoryItem {
  name: string;
  entries: number;
  exits: number;
  total: number;
}

interface HistoryListProps {
  operations: OperationsItem[];
}

const ICON_SIZE = 20;

const Icon = ({ id }) => (
  <div
    className={clsx(
      "flex items-center justify-center p-1.5 border-0 rounded-lg",
      {
        "bg-alert/10 dark:bg-alert/20 border-alert text-alert": id === 1,
        "bg-ready/10 dark:bg-ready/20 border-ready text-ready": id === 2,
        "bg-warning/10 dark:bg-warning/20 border-warning text-warning":
          id === 3 || id === 4 || (id >= 9 && id <= 14),
        "bg-op-entry/10 dark:bg-op-entry/20 border-op-entry text-op-entry":
          id === 5,
        "bg-op-exit/10 dark:bg-op-exit/20 border-op-exit text-op-exit":
          id === 6,
        "bg-op-swap/10 dark:bg-op-swap/20 border-op-swap text-op-swap":
          id === 7 || id === 8,
        "bg-slate-100 border-slate-200 text-slate-600": id > 14,
      }
    )}
  >
    {id === 1 && <BellOff size={ICON_SIZE} />}
    {id === 2 && <Bell size={ICON_SIZE} />}
    {id === 3 && <UserRoundCog size={ICON_SIZE} />}
    {id === 4 && <Bell size={ICON_SIZE} />}
    {id === 5 && <UserRoundPlus size={ICON_SIZE} />}
    {id === 6 && <UserRoundMinus size={ICON_SIZE} />}
    {id === 7 && <ArrowLeftRight size={ICON_SIZE} />}
    {id === 8 && <ArrowRightLeft size={ICON_SIZE} />}
    {id >= 9 && id <= 14 && <Bookmark size={ICON_SIZE} />}
    {id > 14 && <X size={ICON_SIZE} />}
  </div>
);

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="grid gap-3">
      {history.map((item, key) => (
        <div className="flex items-center justify-between text-sm" key={key}>
          <div className="flex items-center gap-4">
            <Icon id={item.operation.id} />
            <div className="flex flex-col gap-0.5">
              <p className="leading-none font-medium">
                {item.device.key} - {item.mode.key}
              </p>
              <p className="text-muted-foreground text-sm">
                {item.operation.key}
              </p>
            </div>
          </div>
          <div className="flex flex-col text-right text-muted-foreground text-sm">
            <span>{item.date.slice(0, 10)}</span>
            <span>{item.date.slice(11, 19)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
