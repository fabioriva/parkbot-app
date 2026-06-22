import { Stall } from "~/components/map-stall";

export function Level({ definitions, level, view }) {
  return (
    <div className="flex flex-col gap-0.5 w-fit">
      <div className="flex text-xs">
        <h1 className="grow">{level.label}</h1>
        <p className="text-muted-foreground">
          {level.min} - {level.max}
        </p>
      </div>
      <div className="level relative bg-card border" id={"l-" + level.nr}>
        {level?.elevators !== undefined &&
          level.elevators.map((el, i) => (
            <div
              className="absolute h-[30px] w-[40px] leading-[30px] bg-muted text-center text-sm el"
              id={el.id}
              key={i}
            >
              {el.label}
            </div>
          ))}
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
