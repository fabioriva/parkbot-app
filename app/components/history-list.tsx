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
        "bg-red-200 border-red-600 text-red-600": id === 1,
        "bg-green-200 border-green-600 text-green-600": id === 2,
        "bg-yellow-200 border-yellow-600 text-yellow-600": id === 3 || id === 4,
        "bg-blue-200 border-blue-600 text-blue-600": id === 5 || id === 7,
        "bg-purple-200 border-purple-600 text-purple-600": id === 6 || id === 8,
        "bg-amber-200 border-amber-600 text-amber-600": id >= 9 && id <= 14,
        "bg-slate-200 border-slate-600 text-slate-600": id > 14,
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
