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
          top: 2px;
          left: 43px;
        }
        #s-3 {
          top: 64px;
          left: 43px;
        }
        #s-4 {
          top: 95px;
          left: 43px;
        }
        #s-5 {
          top: 2px;
          left: 84px;
        }
        #s-6 {
          top: 64px;
          left: 84px;
        }
        #s-7 {
          top: 95px;
          left: 84px;
        }
        #s-8 {
          top: 2px;
          left: 125px;
        }
        #s-9 {
          top: 64px;
          left: 125px;
        }
        #s-10 {
          top: 95px;
          left: 125px;
        }

        #s-11 {
          top: 2px;
          left: 2px;
        }
        #s-12 {
          top: 2px;
          left: 43px;
        }
        #s-13 {
          top: 64px;
          left: 43px;
        }
        #s-14 {
          top: 95px;
          left: 43px;
        }
        #s-15 {
          top: 2px;
          left: 84px;
        }
        #s-16 {
          top: 64px;
          left: 84px;
        }
        #s-17 {
          top: 95px;
          left: 84px;
        }
        #s-18 {
          top: 2px;
          left: 125px;
        }
        #s-19 {
          top: 64px;
          left: 125px;
        }
        #s-20 {
          top: 95px;
          left: 125px;
        }

        #s-21 {
          top: 2px;
          left: 2px;
        }
        #s-22 {
          top: 2px;
          left: 43px;
        }
        #s-23 {
          top: 64px;
          left: 43px;
        }
        #s-24 {
          top: 95px;
          left: 43px;
        }
        #s-25 {
          top: 64px;
          left: 84px;
        }
        #s-26 {
          top: 95px;
          left: 84px;
        }
        #s-27 {
          top: 64px;
          left: 125px;
        }
        #s-28 {
          top: 95px;
          left: 125px;
        }

        #s-29 {
          top: 2px;
          left: 2px;
        }
        #s-30 {
          top: 2px;
          left: 43px;
        }
        #s-31 {
          top: 64px;
          left: 43px;
        }
        #s-32 {
          top: 95px;
          left: 43px;
        }
        #s-33 {
          top: 64px;
          left: 84px;
        }
        #s-34 {
          top: 95px;
          left: 84px;
        }
      `}</style>
    </div>
  );
}
