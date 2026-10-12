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
          height: 190px;
          width: 128px;
        }
        /* Level -3 */
        #el-1 {
          top: 33px;
          left: 43px;
        }
        #s-10 {
          top: 2px;
          left: 2px;
        }
        #s-8 {
          top: 33px;
          left: 2px;
        }
        #s-6 {
          top: 64px;
          left: 2px;
        }
        #s-4 {
          top: 95px;
          left: 2px;
        }
        #s-2 {
          top: 126px;
          left: 2px;
        }
        #s-1 {
          top: 157px;
          left: 2px;
        }
        #s-11 {
          top: 2px;
          left: 84px;
        }
        #s-9 {
          top: 33px;
          left: 84px;
        }
        #s-7 {
          top: 64px;
          left: 84px;
        }
        #s-5 {
          top: 95px;
          left: 84px;
        }
        #s-3 {
          top: 126px;
          left: 84px;
        }

        #s-21 {
          top: 2px;
          left: 2px;
        }
        #s-19 {
          top: 33px;
          left: 2px;
        }
        #s-17 {
          top: 64px;
          left: 2px;
        }
        #s-15 {
          top: 95px;
          left: 2px;
        }
        #s-13 {
          top: 126px;
          left: 2px;
        }
        #s-12 {
          top: 157px;
          left: 2px;
        }
        #s-22 {
          top: 2px;
          left: 84px;
        }
        #s-20 {
          top: 33px;
          left: 84px;
        }
        #s-18 {
          top: 64px;
          left: 84px;
        }
        #s-16 {
          top: 95px;
          left: 84px;
        }
        #s-14 {
          top: 126px;
          left: 84px;
        }

        #s-32 {
          top: 2px;
          left: 2px;
        }
        #s-30 {
          top: 33px;
          left: 2px;
        }
        #s-28 {
          top: 64px;
          left: 2px;
        }
        #s-26 {
          top: 95px;
          left: 2px;
        }
        #s-24 {
          top: 126px;
          left: 2px;
        }
        #s-23 {
          top: 157px;
          left: 2px;
        }
        #s-33 {
          top: 2px;
          left: 84px;
        }
        #s-31 {
          top: 33px;
          left: 84px;
        }
        #s-29 {
          top: 64px;
          left: 84px;
        }
        #s-27 {
          top: 95px;
          left: 84px;
        }
        #s-25 {
          top: 126px;
          left: 84px;
        }
      `}</style>
    </div>
  )
}
