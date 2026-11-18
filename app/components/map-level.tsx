import type { ComponentProps } from "react"
import { Stall } from "~/components/map-stall"
import { m } from "@paraglide/messages.js"

type StallProps = ComponentProps<typeof Stall>

interface LevelProps extends Pick<StallProps, "definitions" | "view"> {
  level: {
    nr: string | number
    label: string
    min: number
    max: number
    elevators?: {
      id: string
      label: string
    }[]
    stalls: StallProps["stall"][]
  }
}

export function Level({ definitions, level, view }: LevelProps) {
  return (
    <div className="flex w-fit flex-col gap-1.5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm leading-5 font-semibold">{level.label}</h2>
        <p className="text-xs leading-4 text-muted-foreground tabular-nums">
          {m.map_level_slots({ min: level.min, max: level.max })}
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
