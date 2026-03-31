import { Stall } from "~/components/map-stall";

export function Level({ definitions, level, view }) {
  return (
    <div>
      <p className="py-1 text-sm">
        {level.label}: {level.min} - {level.max}
      </p>
      <div className="level relative border bg-sidebar" id={"l-" + level.nr}>
        {level.stalls.map((stall) => (
          <Stall
            definitions={definitions}
            stall={stall}
            view={view}
            key={stall.nr}
          />
        ))}
      </div>
    </div>
  );
}
