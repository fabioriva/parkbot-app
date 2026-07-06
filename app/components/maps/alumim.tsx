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
          height: 129px;
          width: 292px;
        }
        /* Level -3 */
        #el-1 {
          top: 33px;
          left: 43px;
        }
        #s-1 {
          top: 2px;
          left: 2px;
        }
        #s-2 {
          top: 64px;
          left: 2px;
        }
        #s-3 {
          top: 2px;
          left: 43px;
        }
        #s-4 {
          top: 64px;
          left: 43px;
        }
        #s-5 {
          top: 95px;
          left: 43px;
        }
        #s-6 {
          top: 2px;
          left: 84px;
        }
        #s-7 {
          top: 2px;
          left: 125px;
        }
        #s-8 {
          top: 2px;
          left: 166px;
        }
        #s-9 {
          top: 2px;
          left: 207px;
        }
        #s-10 {
          top: 64px;
          left: 207px;
        }
        #s-11 {
          top: 95px;
          left: 207px;
        }
        #s-12 {
          top: 2px;
          left: 248px;
        }
        /* Level -2 */
        #el-2 {
          top: 33px;
          left: 43px;
        }
        #s-13 {
          top: 2px;
          left: 2px;
        }
        #s-14 {
          top: 64px;
          left: 2px;
        }
        #s-15 {
          top: 2px;
          left: 43px;
        }
        #s-16 {
          top: 64px;
          left: 43px;
        }
        #s-17 {
          top: 95px;
          left: 43px;
        }
        #s-18 {
          top: 2px;
          left: 84px;
        }
        #s-19 {
          top: 2px;
          left: 125px;
        }
        #s-20 {
          top: 2px;
          left: 166px;
        }
        #s-21 {
          top: 2px;
          left: 207px;
        }
        #s-22 {
          top: 64px;
          left: 207px;
        }
        #s-23 {
          top: 95px;
          left: 207px;
        }
        #s-24 {
          top: 2px;
          left: 248px;
        }
        /* Level -1 */
        #el-3 {
          top: 33px;
          left: 43px;
        }
        #s-25 {
          top: 2px;
          left: 2px;
        }
        #s-26 {
          top: 64px;
          left: 2px;
        }
        #s-27 {
          top: 2px;
          left: 43px;
        }
        #s-28 {
          top: 64px;
          left: 43px;
        }
        #s-29 {
          top: 95px;
          left: 43px;
        }
        #s-30 {
          top: 2px;
          left: 84px;
        }
        #s-31 {
          top: 2px;
          left: 125px;
        }
        #s-32 {
          top: 2px;
          left: 166px;
        }
        #s-33 {
          top: 2px;
          left: 207px;
        }
        #s-34 {
          top: 64px;
          left: 207px;
        }
        #s-35 {
          top: 95px;
          left: 207px;
        }
        #s-36 {
          top: 2px;
          left: 248px;
        }
      `}</style>
    </div>
  );
}
