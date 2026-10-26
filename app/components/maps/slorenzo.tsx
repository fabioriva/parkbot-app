import { Level } from "~/components/map-level"
import type { MapProps } from "./types"

export default function Map({ data, view }: MapProps) {
  const levels = [...data.levels].reverse() // Creates a copy and reverses it
  return (
    <div className="flex flex-wrap gap-3 overflow-auto">
      {levels.map((level) => (
        <Level
          definitions={data.definitions}
          level={level}
          view={view}
          key={level.nr}
        />
      ))}
      <style>{`
        .level {
          height: 98px;
          width: 168px;
        }
        #t {
          top: 20px;
          left: 43px;
        }
        #s-1 {
          top: 33px;
          left: 2px;
        }
        #s-2 {
          top: 2px;
          left: 2px;
        }
        #s-5 {
          top: 2px;
          left: 84px;
        }
        #s-3 {
          top: 33px;
          left: 84px;
        }
        #s-6 {
          top: 2px;
          left: 125px;
        }
        #s-4 {
          top: 33px;
          left: 125px;
        }
        #s-7 {
          top: 33px;
          left: 2px;
        }
        #s-8 {
          top: 2px;
          left: 2px;
        }
        #s-9 {
          top: 33px;
          left: 2px;
        }
        #s-12 {
          top: 2px;
          left: 2px;
        }
        #s-13 {
          top: 2px;
          left: 84px;
        }
        #s-10 {
          top: 33px;
          left: 84px;
        }
        #s-14 {
          top: 2px;
          left: 125px;
        }
        #s-11 {
          top: 33px;
          left: 125px;
        }
    `}</style>
    </div>
  )
}
