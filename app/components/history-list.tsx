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
  <>
    {id === 1 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-red-200 rounded-full text-red-600"
        }
      >
        <BellOff size={24} />
      </div>
    )}
    {id === 2 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-green-200 rounded-full text-green-600"
        }
      >
        <Bell size={24} />
      </div>
    )}
    {id === 3 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-yellow-200 rounded-full text-yellow-600"
        }
      >
        <UserRoundCog size={24} />
      </div>
    )}
    {id === 4 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-yellow-200 rounded-full text-yellow-600"
        }
      >
        <Bell size={24} />
      </div>
    )}
    {id === 5 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-blue-200 rounded-full text-blue-600"
        }
      >
        <UserRoundPlus size={24} />
      </div>
    )}
    {id === 6 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-purple-200 rounded-full text-purple-600"
        }
      >
        <UserRoundMinus size={24} />
      </div>
    )}
    {id === 7 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-blue-200 rounded-full text-blue-600"
        }
      >
        <ArrowLeftRight size={24} />
      </div>
    )}
    {id === 8 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-purple-200 rounded-full text-purple-600"
        }
      >
        <ArrowRightLeft size={24} />
      </div>
    )}
    {id >= 9 && id <= 14 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-amber-200 rounded-full text-amber-600"
        }
      >
        <Bookmark size={24} />
      </div>
    )}
    {id > 14 && (
      <div
        className={
          "flex items-center justify-center p-2 bg-slate-200 rounded-full text-slate-600"
        }
      >
        <X size={24} />
      </div>
    )}
  </>
);

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="grid gap-3">
      {history.map((item, key) => (
        <div className="flex items-center justify-between text-sm" key={key}>
          <div className="flex items-center gap-4">
            <Icon id={item.operation.id} />
            <div className="flex flex-col gap-1">
              <p className="leading-none font-medium">
                {item.device.key} - {item.mode.key}
              </p>
              <p className="text-muted-foreground text-sm">
                {item.operation.key}
              </p>
            </div>
          </div>
          <div className="flex flex-col text-right text-muted-foreground text-sm">
            <p>{item.date.slice(0, 10)}</p>
            <p>{item.date.slice(11, 19)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
