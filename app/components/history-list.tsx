import { useTranslation } from "react-i18next";
import clsx from "clsx";
// import {
//   ArrowLeftRight,
//   ArrowRightLeft,
//   Bell,
//   BellOff,
//   Bookmark,
//   IdCard,
//   User,
//   UserRoundCog,
//   UserRoundPlus,
//   UserRoundMinus,
//   X,
// } from "lucide-react";
import {
  Item,
  // ItemActions,
  ItemContent,
  ItemDescription,
  // ItemGroup,
  ItemMedia,
  // ItemSeparator,
  ItemTitle,
} from "~/components/ui/item";

// import type { Log } from "~/routes/aps/types";

interface HistoryItemProps {
  // item: Log;
  item: any;
}

interface HistoryListProps {
  history: HistoryItemProps[];
}

export function operation(item, t) {
  const { alarm, card, operation, mode, stall, uid } = item;
  switch (operation.id) {
    case 1:
    case 2:
      return t("aps.alarms." + item.alarm.key, item.alarm.query);
    case 3:
      return t("aps.history.list.op-id-3", { id: mode.id });
    case 4:
      return t("aps.history.list.op-id-4", { card });
    case 5:
      return t("aps.history.list.op-id-5", { card, stall });
    case 6:
      return t("aps.history.list.op-id-6", { card, stall });
    case 7:
      return t("aps.history.list.op-id-7", { card, stall });
    case 8:
      return t("aps.history.list.op-id-8", { card, stall });
    case 9:
      return t("aps.history.list.op-id-9", { stall });
    case 10:
      return t("aps.history.list.op-id-10", { card });
    case 11:
      return t("aps.history.list.op-id-11", { card });
    case 12:
      return t("aps.history.list.op-id-12", { card });
    case 13:
      return t("aps.history.list.op-id-13", { card });
    case 14:
      return t("aps.history.list.op-id-14", { card });
    default:
      return `Operation ${operation.id}`;
  }
}

// const HistoryListItem = ({ item }: HistoryItemProps) => (
//   <Item size="sm" className="px-0 py-1 gap-6">
//     {/* <ItemIcon id={item.operation.id} /> */}
//     <ItemMedia variant="icon">
//       {item.device.id !== 0 ? (
//         <span className={item.device.key.length > 2 ? "text-xs" : undefined}>
//           {item.device.key}
//         </span>
//       ) : (
//         <User />
//       )}
//     </ItemMedia>
//     <ItemContent className="gap-0.5">
//       <ItemTitle className="line-clamp-1">
//         {/* {item.device.key} -{" "}
//         <span className="text-muted-foreground">{item.mode.key}</span> */}
//         {item.mode.id} - {item.mode.key}
//       </ItemTitle>
//       <ItemDescription>{item.operation.key}</ItemDescription>
//     </ItemContent>
//     <ItemContent className="flex-none text-right">
//       <ItemDescription className="flex flex-col">
//         <span>{item.date.slice(0, 10)}</span>
//         <span>{item.date.slice(11, 19)}</span>
//       </ItemDescription>
//     </ItemContent>
//   </Item>
// );

export function HistoryList({ history }: HistoryListProps) {
  // console.log(history);
  const { t } = useTranslation();
  return (
    <>
      {history.map((item, key) => (
        // <HistoryListItem item={item} key={key} />
        <Item size="sm" className="px-0 py-1 gap-6" key={key}>
          {/* <ItemIcon id={item.operation.id} /> */}
          {/* <ItemMedia variant="icon">
            {item.device.id !== 0 ? (
              <span
                className={item.device.key.length > 2 ? "text-xs" : undefined}
              >
                {item.device.key}
              </span>
            ) : (
              <User />
            )}
          </ItemMedia> */}
          <ItemContent className="gap-0.5">
            <ItemTitle className="line-clamp-1">
              {item.device.id === 0 && t("aps.history.list.operator")}
              {item.device.id !== 0 && item.device.key}
              {item.device.id !== 0 && (
                <span className="lowercase">
                  {" "}
                  {t("aps.mode." + item.mode.key)}
                </span>
              )}
            </ItemTitle>
            <ItemDescription>
              {/* {t("aps.history.table." + item.operation.key)} */}
              {operation(item, t)}
            </ItemDescription>
          </ItemContent>
          <ItemContent className="flex-none text-right">
            <ItemDescription className="flex flex-col">
              <span>{item.date.slice(0, 10)}</span>
              <span>{item.date.slice(11, 19)}</span>
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </>
    // <div className="grid gap-3">
    //   {history.map((item, key) => (
    //     <HistoryListItem item={item} key={key} />
    //     <div className="flex items-center justify-between text-sm" key={key}>
    //       <div className="flex items-center gap-4">
    //         <Icon id={item.operation.id} />
    //         <div className="flex flex-col gap-0.5">
    //           <p className="leading-none font-medium">
    //             {item.device.key} - {item.mode.key}
    //           </p>
    //           <p className="text-muted-foreground text-sm">
    //             {item.operation.key}
    //           </p>
    //         </div>
    //       </div>
    //       <div className="flex flex-col text-right text-muted-foreground text-sm">
    //         <span>{item.date.slice(0, 10)}</span>
    //         <span>{item.date.slice(11, 19)}</span>
    //       </div>
    //     </div>
    //   ))}
    // </div>
  );
}

// const ICON_SIZE = 24;

// const Icon = ({ id }) => (
//   <div
//     className={clsx(
//       // "flex items-center justify-center p-1.5 border-0 rounded-lg",
//       {
//         "bg-alert/10 dark:bg-alert/20 border-alert text-alert": id === 1,
//         "bg-ready/10 dark:bg-ready/20 border-ready text-ready": id === 2,
//         "bg-warning/10 dark:bg-warning/20 border-warning text-warning":
//           id === 3 || id === 4 || (id >= 9 && id <= 14),
//         "bg-op-entry/10 dark:bg-op-entry/20 border-op-entry text-op-entry":
//           id === 5,
//         "bg-op-exit/10 dark:bg-op-exit/20 border-op-exit text-op-exit":
//           id === 6,
//         "bg-op-swap/10 dark:bg-op-swap/20 border-op-swap text-op-swap":
//           id === 7 || id === 8,
//         "bg-slate-100 border-slate-200 text-slate-600": id > 14,
//       }
//     )}
//   >
//     {id === 1 && <BellOff size={ICON_SIZE} />}
//     {id === 2 && <Bell size={ICON_SIZE} />}
//     {id === 3 && <UserRoundCog size={ICON_SIZE} />}
//     {id === 4 && <Bell size={ICON_SIZE} />}
//     {id === 5 && <UserRoundPlus size={ICON_SIZE} />}
//     {id === 6 && <UserRoundMinus size={ICON_SIZE} />}
//     {id === 7 && <ArrowLeftRight size={ICON_SIZE} />}
//     {id === 8 && <ArrowRightLeft size={ICON_SIZE} />}
//     {id >= 9 && id <= 14 && <Bookmark size={ICON_SIZE} />}
//     {id > 14 && <X size={ICON_SIZE} />}
//   </div>
// );

// const ItemIcon = ({ id }) => (
//   <ItemMedia
//     variant="icon"
//     className={clsx({
//       "bg-alert/10 dark:bg-alert/20 text-alert": id === 1,
//       "bg-ready/10 dark:bg-ready/20 text-ready": id === 2,
//       "bg-warning/10 dark:bg-warning/20 text-warning":
//         id === 3 || id === 4 || (id >= 9 && id <= 14),
//       "bg-op-entry/10 dark:bg-op-entry/20 text-op-entry": id === 5,
//       "bg-op-exit/10 dark:bg-op-exit/20 text-op-exit": id === 6,
//       "bg-op-swap/10 dark:bg-op-swap/20 text-op-swap": id === 7 || id === 8,
//       "bg-slate-100 border-slate-200 text-slate-600": id > 14,
//     })}
//   >
//     {id === 1 && <BellOff />}
//     {id === 2 && <Bell />}
//     {id === 3 && <UserRoundCog />}
//     {id === 4 && <Bell />}
//     {id === 5 && <UserRoundPlus />}
//     {id === 6 && <UserRoundMinus />}
//     {id === 7 && <ArrowLeftRight />}
//     {id === 8 && <ArrowRightLeft />}
//     {id >= 9 && id <= 14 && <Bookmark />}
//     {id > 14 && <X />}
//   </ItemMedia>
// );
