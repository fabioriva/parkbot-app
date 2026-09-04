import { Stall } from "~/components/map-stall"

export function Level({ definitions, level, view }) {
  return (
    <div className="flex w-fit flex-col gap-1.5">
      <div className="flex flex-col gap-0 text-xs">
        <h1 className="grow">{level.label}</h1>
        <p className="text-muted-foreground">
          Slots {level.min} - {level.max}
        </p>
      </div>
      <div className="level relative border bg-card" id={"l-" + level.nr}>
        {level?.elevators !== undefined &&
          level.elevators.map((el, i) => (
            <div
              className="el absolute h-7.5 w-10 bg-muted text-center text-sm leading-7.5"
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
  )
}
