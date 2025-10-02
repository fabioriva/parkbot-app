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

const Icon = ({ id }) => (
  <div
    className={clsx(
      "flex items-center justify-center h-[36px] w-[36px] border rounded-full",
      {
        "bg-alert border-alert text-alert-foreground": id === 1,
        "bg-ready border-op-ready text-ready-ready": id === 2,
        "bg-warning border-warning text-warning-foreground":
          id === 3 || id === 4,
        "bg-op-entry border-op-entry text-op-entry-foreground": id === 5,
        "bg-op-exit border-op-exit text-op-exit-foreground": id === 6,
        "bg-op-swap border-op-swap text-op-swap-foreground":
          id === 7 || id === 8,
        "bg-amber-100 border-amber-200 text-amber-600": id >= 9 && id <= 14,
        "bg-slate-100 border-slate-200 text-slate-600": id > 14,
      }
    )}
  >
    {id === 1 && <BellOff size={20} />}
    {id === 2 && <Bell size={20} />}
    {id === 3 && <UserRoundCog size={20} />}
    {id === 4 && <Bell size={20} />}
    {id === 5 && <UserRoundPlus size={20} />}
    {id === 6 && <UserRoundMinus size={20} />}
    {id === 7 && <ArrowLeftRight size={20} />}
    {id === 8 && <ArrowRightLeft size={20} />}
    {id >= 9 && id <= 14 && <Bookmark size={20} />}
    {id > 14 && <X size={20} />}
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
