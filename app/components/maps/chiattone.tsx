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
          height: 132px;
          width: 374px;
        }
        /* Level -1 SH1 */
        #s-1 {
          top: 66px;
          left: 2px;
        }
        #s-2 {
          top: 34px;
          left: 2px;
        }
        #s-3 {
          top: 2px;
          left: 43px;
        }
        #s-4 {
          top: 2px;
          left: 84px;
        }
        #s-5 {
          top: 2px;
          left: 125px;
        }
        #s-6 {
          top: 2px;
          left: 166px;
        }
        #s-7 {
          top: 2px;
          left: 207px;
        }
        #s-8 {
          top: 2px;
          left: 248px;
        }
        #s-9 {
          top: 2px;
          left: 289px;
        }
        #s-10 {
          top: 2px;
          left: 330px;
        }
        #s-11 {
          top: 66px;
          left: 330px;
        }
        #s-12 {
          top: 98px;
          left: 330px;
        }
        #s-13 {
          top: 98px;
          left: 289px;
        }
        /* Level -2 SH2 */
        #s-14 {
          top: 66px;
          left: 2px;
        }
        #s-15 {
          top: 34px;
          left: 2px;
        }
        #s-16 {
          top: 2px;
          left: 43px;
        }
        #s-17 {
          top: 2px;
          left: 84px;
        }
        #s-18 {
          top: 2px;
          left: 125px;
        }
        #s-19 {
          top: 2px;
          left: 166px;
        }
        #s-20 {
          top: 2px;
          left: 207px;
        }
        #s-21 {
          top: 2px;
          left: 248px;
        }
        #s-22 {
          top: 2px;
          left: 289px;
        }
        #s-23 {
          top: 2px;
          left: 330px;
        }
        #s-24 {
          top: 66px;
          left: 330px;
        }
        #s-25 {
          top: 98px;
          left: 330px;
        }
        #s-26 {
          top: 98px;
          left: 289px;
        }
        /* Level -2 SH2 */
        #s-27 {
          top: 66px;
          left: 2px;
        }
        #s-28 {
          top: 34px;
          left: 2px;
        }
        #s-29 {
          top: 2px;
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
          top: 2px;
          left: 248px;
        }
        #s-35 {
          top: 2px;
          left: 289px;
        }
        #s-36 {
          top: 2px;
          left: 330px;
        }
        #s-37 {
          top: 66px;
          left: 330px;
        }
        #s-38 {
          top: 98px;
          left: 330px;
        }
        #s-39 {
          top: 98px;
          left: 289px;
        }

        #el-1 {
          top: 66px;
          left: 289px;
        }
        #el-2 {
          top: 66px;
          left: 289px;
        }
        #el-3 {
          top: 66px;
          left: 289px;
        }
      `}</style>
    </div>
  );
}
