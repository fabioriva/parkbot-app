import clsx from "clsx";

export function Stall({
  definitions,
  stall: { date, nr, size, status },
  view,
}) {
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus;
  return (
    <div
      className={clsx(
        "absolute h-[30px] w-[40px] border flex items-center justify-center text-xs",
        {
          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
            status !== 0 && status !== LOCK,
          "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300":
            status === FREE,
          "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300":
            status === LOCK,
          // "bg-sky-700/20 text-sky-700": status === PAPA,
          // "bg-yellow-700/20 text-yellow-700": status === RSVD,
        },
      )}
      id={"s-" + nr}
    >
      {view === "view1" && status}
      {view === "view2" && nr}
      {view === "view3" && size}
    </div>
  );
}
