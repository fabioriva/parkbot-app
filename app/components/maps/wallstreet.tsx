import clsx from "clsx";
import "./wallstreet.css";

const Stall = ({ stall, status }) => (
  <div
    className={clsx("absolute h-[30px] w-[40px] border text-center", {
      "bg-alert/10 dark:bg-alert/20 border-alert text-alert":
        stall.status !== 0,
      "bg-ready/10 dark:bg-ready/20 border-ready text-ready":
        stall.status === status.FREE,
      "bg-op-exit/10 dark:bg-op-exit/20 border-op-exit text-op-exit":
        stall.status === status.LOCK,
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
      <h1 className="test">Spire</h1>
      {data?.levels.map((level) => (
        <div className="bg-card" key={level.nr}>
          <span className="text-sm">
            {level.label}: {level.min} - {level.max}
          </span>
          <div
            className="relative bg-transparent border border-dotted w-full l"
            id={"l-" + level.nr}
          >
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
