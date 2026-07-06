import { Level } from "~/components/map-level";

export default function Map({ data, view }) {
  const levels = [...data.levels].reverse(); // Creates a copy and reverses it
  return (
    <div className="overflow-auto flex flex-wrap gap-3">
      {levels.map((level) => (
        <Level
          definitions={data?.definitions}
          level={level}
          view={view}
          key={level.nr}
        />
      ))}
      <style jsx="true">{`
        .level {
          height: 160px;
          width: 333px;
        }
        #el-1 {
          top: 95px;
          left: 43px;
        }
        /* P1 */
        #s-1 {
          top: 2px;
          left: 289px;
        }
        #s-2 {
          top: 33px;
          left: 289px;
        }
        #s-3 {
          top: 64px;
          left: 289px;
        }
        #s-4 {
          top: 2px;
          left: 248px;
        }
        #s-5 {
          top: 33px;
          left: 248px;
        }
        #s-6 {
          top: 64px;
          left: 248px;
        }
        #s-7 {
          top: 2px;
          left: 207px;
        }
        #s-8 {
          top: 33px;
          left: 207px;
        }
        #s-9 {
          top: 64px;
          left: 207px;
        }
        #s-10 {
          top: 2px;
          left: 166px;
        }
        #s-11 {
          top: 33px;
          left: 166px;
        }
        #s-12 {
          top: 64px;
          left: 166px;
        }
        #s-13 {
          top: 2px;
          left: 125px;
        }
        #s-14 {
          top: 33px;
          left: 125px;
        }
        #s-15 {
          top: 64px;
          left: 125px;
        }
        #s-16 {
          top: 64px;
          left: 84px;
        }
        #s-17 {
          top: 64px;
          left: 43px;
        }
        /* P2 */
        #s-18 {
          top: 2px;
          left: 289px;
        }
        #s-19 {
          top: 33px;
          left: 289px;
        }
        #s-20 {
          top: 64px;
          left: 289px;
        }
        #s-21 {
          top: 2px;
          left: 248px;
        }
        #s-22 {
          top: 33px;
          left: 248px;
        }
        #s-23 {
          top: 64px;
          left: 248px;
        }
        #s-24 {
          top: 2px;
          left: 207px;
        }
        #s-25 {
          top: 33px;
          left: 207px;
        }
        #s-26 {
          top: 64px;
          left: 207px;
        }
        #s-27 {
          top: 2px;
          left: 166px;
        }
        #s-28 {
          top: 33px;
          left: 166px;
        }
        #s-29 {
          top: 64px;
          left: 166px;
        }
        #s-30 {
          top: 2px;
          left: 125px;
        }
        #s-31 {
          top: 33px;
          left: 125px;
        }
        #s-32 {
          top: 64px;
          left: 125px;
        }
        #s-33 {
          top: 64px;
          left: 43px;
        }
      `}</style>
    </div>
  );
}
