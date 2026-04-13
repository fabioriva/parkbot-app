import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useEditStallDialog } from "~/components/edit-stall-dialog";

export function Stall({ definitions, stall, view }) {
  const { date, nr, size, status } = stall;
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus;
  const { t } = useTranslation();
  const { showEditDialog } = useEditStallDialog();
  const handleConfirm = (value) => {
    console.log(`Stall nr ${nr} changed from ${status} to ${value}`);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={clsx(
            "absolute h-[30px] w-[40px] border flex items-center justify-center text-xs hover:cursor-pointer",
            {
              "bg-red-300 text-red-950 dark:bg-red-950 dark:text-red-300":
                status !== 0 &&
                status !== LOCK &&
                status !== PAPA &&
                status !== RSVD,
              "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300":
                status === FREE,
              "bg-purple-300 text-purple-950 dark:bg-purple-950 dark:text-purple-300":
                status === LOCK,
              "bg-blue-300 text-blue-950 dark:bg-blue-950 dark:text-blue-300":
                status === PAPA,
              "bg-amber-300 text-amber-950 dark:bg-amber-950 dark:text-amber-300":
                status === RSVD,
            },
          )}
          id={"s-" + nr}
          onClick={() =>
            showEditDialog({
              definitions,
              stall,
              onConfirm: (value) => handleConfirm(value),
            })
          }
        >
          {view === "view0" && status === LOCK && (
            <span className="text-xl">🔒</span>
          )}
          {view === "view0" && status === PAPA && (
            <span className="text-xl">🚗</span>
          )}
          {view === "view0" && status === RSVD && (
            <span className="text-xl">🚗</span>
          )}
          {view === "view0" && status !== LOCK && status !== 0 && (
            <span className="text-xl">🚗</span>
          )}
          {view === "view1" && status}
          {view === "view2" && nr}
          {view === "view3" && size}
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-center text-sm">
        {status === 0
          ? t("map.stall-free", { date, nr })
          : status === LOCK
            ? t("map.stall-lock", { date, nr })
            : t("map.stall-busy", { date, nr, status })}
      </TooltipContent>
    </Tooltip>
  );
}
