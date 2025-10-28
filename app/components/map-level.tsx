import clsx from "clsx";

const Stall = ({ stall, status, view }) => (
  <div
    className={clsx("absolute h-[30px] w-[40px] border text-center", {
      "bg-alert/20 text-alert": stall.status !== 0,
      "bg-ready/20 text-ready": stall.status === status.FREE,
      "bg-op-exit/20 text-op-exit": stall.status === status.LOCK,
      "bg-sky-500": stall.status === status.PAPA,
      "bg-yellow-500": stall.status === status.RSVD,
    })}
    id={"s-" + stall.nr}
  >
    <span className="font-semibold text-xs">
      {view === "view-1" && stall.status}
      {view === "view-2" && stall.nr}
      {view === "view-3" && stall.size}
    </span>
  </div>
);

export function Level({ definitions, level, view }) {
  return (
    <div>
      <span className="text-sm">
        {level.label}: {level.min} - {level.max}
      </span>
      <div
        className="l relative bg-card border border-dotted"
        id={"l-" + level.nr}
      >
        {level.elevators &&
          level.elevators.map((elevator) => (
            <div
              className="absolute h-[30px] w-[40px] bg-slate-700/10 dark:bg-slate-700/20 text-center el"
              id={elevator.id}
              key={elevator.id}
            >
              <span className="font-semibold text-xs">{elevator.label}</span>
            </div>
          ))}
        {level?.stalls.map((stall) => (
          <Stall
            stall={stall}
            status={definitions.stallStatus}
            view={view}
            key={stall.nr}
          />
        ))}
      </div>
    </div>
  );
}
