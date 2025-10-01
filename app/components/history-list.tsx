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
// import { Avatar, AvatarFallback } from "~/components/ui/avatar";
// import { Separator } from "~/components/ui/separator";

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
          "flex items-center justify-center h-[36px] w-[36px] bg-red-200 p-1.5 rounded-sm text-red-600"
        }
      >
        <BellOff color="red" size={20} />
      </div>
    )}
    {id === 2 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-green-200 p-1.5 rounded-sm text-green-600"
        }
      >
        <Bell color="green" size={20} />
      </div>
    )}
    {id === 3 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-yellow-200 p-1.5 rounded-sm text-yellow-600"
        }
      >
        <UserRoundCog color="yellow" size={20} />
      </div>
    )}
    {id === 4 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-yellow-200 p-1.5 rounded-sm text-yellow-600"
        }
      >
        <Bell color="yellow" size={20} />
      </div>
    )}
    {id === 5 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-blue-200 p-1.5 rounded-sm text-blue-600"
        }
      >
        <UserRoundPlus color="blue" size={20} />
      </div>
    )}
    {id === 6 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-purple-200 p-1.5 rounded-sm text-purple-600"
        }
      >
        <UserRoundMinus color="purple" size={20} />
      </div>
    )}
    {id === 7 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-blue-200 p-1.5 rounded-sm text-blue-600"
        }
      >
        <ArrowLeftRight color="blue" size={20} />
      </div>
    )}
    {id === 8 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-purple-200 p-1.5 rounded-sm text-purple-600"
        }
      >
        <ArrowRightLeft color="purple" size={20} />
      </div>
    )}
    {id >= 9 && id <= 14 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-amber-200 rounded-sm text-amber-600"
        }
      >
        <Bookmark size={20} />
      </div>
    )}
    {id > 14 && (
      <div
        className={
          "flex items-center justify-center h-[36px] w-[36px] bg-slate-200 p-1.5 rounded-sm text-slate-600"
        }
      >
        <X size={20} />
      </div>
    )}
  </>
);

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="grid gap-3">
      {history.map((item, key) => (
        <>
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
          {/* <Separator /> */}
        </>
      ))}
    </div>
  );
}
