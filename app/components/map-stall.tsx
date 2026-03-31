import clsx from "clsx";
import { Car, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export function Stall({
  definitions,
  stall: { date, nr, size, status },
  view,
}) {
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus;
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={clsx(
            "absolute h-[30px] w-[40px] border flex items-center justify-center text-xs",
            {
              "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
                status !== 0 &&
                status !== LOCK &&
                status !== PAPA &&
                status !== RSVD,
              "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300":
                status === FREE,
              "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300":
                status === LOCK,
              "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300":
                status === PAPA,
              "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300":
                status === RSVD,
            },
          )}
          id={"s-" + nr}
        >
          {view === "view0" && status === LOCK && <Lock size={20} />}
          {view === "view0" && status === PAPA && <Car size={24} />}
          {view === "view0" && status === RSVD && <Car size={24} />}
          {view === "view0" && status !== LOCK && status !== 0 && (
            <Car size={24} />
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
