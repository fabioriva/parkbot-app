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
          width: 251px;
        }
        #el {
          top: 95px;
          left: 2px;
        }
        /* P1 */
        #s-1 {
          top: 126px;
          left: 2px;
        }
        #s-2 {
          top: 64px;
          left: 2px;
        }
        #s-3 {
          top: 33px;
          left: 2px;
        }
        #s-4 {
          top: 64px;
          left: 43px;
        }
        #s-5 {
          top: 33px;
          left: 43px;
        }
        #s-6 {
          top: 2px;
          left: 43px;
        }
        #s-7 {
          top: 64px;
          left: 84px;
        }
        #s-8 {
          top: 33px;
          left: 84px;
        }
        #s-9 {
          top: 2px;
          left: 84px;
        }
        #s-10 {
          top: 64px;
          left: 125px;
        }
        #s-11 {
          top: 33px;
          left: 125px;
        }
        #s-12 {
          top: 2px;
          left: 125px;
        }
        /* P2 */
        #s-13 {
          top: 126px;
          left: 2px;
        }
        #s-14 {
          top: 64px;
          left: 2px;
        }
        #s-15 {
          top: 33px;
          left: 2px;
        }
        #s-16 {
          top: 126px;
          left: 43px;
        }
        #s-17 {
          top: 64px;
          left: 43px;
        }
        #s-18 {
          top: 33px;
          left: 43px;
        }
        #s-19 {
          top: 2px;
          left: 43px;
        }
        #s-20 {
          top: 64px;
          left: 84px;
        }
        #s-21 {
          top: 33px;
          left: 84px;
        }
        #s-22 {
          top: 2px;
          left: 84px;
        }
        #s-23 {
          top: 64px;
          left: 125px;
        }
        #s-24 {
          top: 33px;
          left: 125px;
        }
        #s-25 {
          top: 2px;
          left: 125px;
        }
        #s-26 {
          top: 126px;
          left: 131px;
        }
        /* P3 */
        #s-27 {
          top: 64px;
          left: 2px;
        }
        #s-28 {
          top: 33px;
          left: 2px;
        }
      `}</style>
    </div>
  );
}
