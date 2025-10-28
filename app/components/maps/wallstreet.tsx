import clsx from "clsx";
import "./wallstreet.css";

const Stall = ({ stall, status }) => (
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
    <span className="font-semibold text-xs">{stall.nr}</span>
  </div>
);

export default function Map({ data }) {
  // console.log(data);
  return (
    <>
      {data?.levels.reverse().map((level) => (
        <div className="bg-card" key={level.nr}>
          <span className="text-sm">
            {level.label}: {level.min} - {level.max}
          </span>
          <div className="l relative border border-dotted" id={"l-" + level.nr}>
            {level.elevators &&
              level.elevators.map((elevator) => (
                <div
                  className="absolute h-[30px] w-[40px] bg-slate-700/10 dark:bg-slate-700/20 text-center el"
                  id={elevator.id}
                  key={elevator.id}
                >
                  <span className="font-semibold text-xs">
                    {elevator.label}
                  </span>
                </div>
              ))}
            {level?.stalls.map((stall) => (
              <Stall
                stall={stall}
                status={data?.definitions.stallStatus}
                key={stall.nr}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
