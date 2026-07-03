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
          height: 191px;
          width: 374px;
        }
        /* Level -3 */
        #t {
          top: 95px;
          left: 330px;
        }

        #s-1 {
          top: 2px;
          left: 2px;
        }
        #s-2 {
          top: 33px;
          left: 2px;
        }
        #s-3 {
          top: 64px;
          left: 2px;
        }
        #s-4 {
          top: 126px;
          left: 2px;
        }
        #s-5 {
          top: 157px;
          left: 2px;
        }
        #s-6 {
          top: 2px;
          left: 43px;
        }
        #s-7 {
          top: 33px;
          left: 43px;
        }
        #s-8 {
          top: 64px;
          left: 43px;
        }
        #s-9 {
          top: 126px;
          left: 43px;
        }
        #s-10 {
          top: 157px;
          left: 43px;
        }
        #s-11 {
          top: 2px;
          left: 84px;
        }
        #s-12 {
          top: 33px;
          left: 84px;
        }
        #s-13 {
          top: 64px;
          left: 84px;
        }
        #s-14 {
          top: 126px;
          left: 84px;
        }
        #s-15 {
          top: 157px;
          left: 84px;
        }
        #s-16 {
          top: 2px;
          left: 125px;
        }
        #s-17 {
          top: 33px;
          left: 125px;
        }
        #s-18 {
          top: 64px;
          left: 125px;
        }
        #s-19 {
          top: 126px;
          left: 125px;
        }
        #s-20 {
          top: 157px;
          left: 125px;
        }
        #s-21 {
          top: 2px;
          left: 166px;
        }
        #s-22 {
          top: 33px;
          left: 166px;
        }
        #s-23 {
          top: 64px;
          left: 166px;
        }
        #s-24 {
          top: 126px;
          left: 166px;
        }
        #s-25 {
          top: 157px;
          left: 166px;
        }
        #s-26 {
          top: 2px;
          left: 207px;
        }
        #s-27 {
          top: 33px;
          left: 207px;
        }
        #s-28 {
          top: 64px;
          left: 207px;
        }
        #s-29 {
          top: 126px;
          left: 207px;
        }
        #s-30 {
          top: 157px;
          left: 207px;
        }
        #s-31 {
          top: 33px;
          left: 248px;
        }
        #s-32 {
          top: 64px;
          left: 248px;
        }
        #s-33 {
          top: 126px;
          left: 248px;
        }
        #s-34 {
          top: 157px;
          left: 248px;
        }
        #s-35 {
          top: 64px;
          left: 289px;
        }
        #s-36 {
          top: 126px;
          left: 289px;
        }
        #s-37 {
          top: 157px;
          left: 289px;
        }
        #s-38 {
          top: 64px;
          left: 330px;
        }
        #s-39 {
          top: 126px;
          left: 330px;
        }
        #s-40 {
          top: 157px;
          left: 330px;
        }
        /* Level -2 */
        #s-41 {
          top: 2px;
          left: 2px;
        }
        #s-42 {
          top: 33px;
          left: 2px;
        }
        #s-43 {
          top: 64px;
          left: 2px;
        }
        #s-44 {
          top: 126px;
          left: 2px;
        }
        #s-45 {
          top: 157px;
          left: 2px;
        }
        #s-46 {
          top: 2px;
          left: 43px;
        }
        #s-47 {
          top: 33px;
          left: 43px;
        }
        #s-48 {
          top: 64px;
          left: 43px;
        }
        #s-49 {
          top: 126px;
          left: 43px;
        }
        #s-50 {
          top: 157px;
          left: 43px;
        }
        #s-51 {
          top: 2px;
          left: 84px;
        }
        #s-52 {
          top: 33px;
          left: 84px;
        }
        #s-53 {
          top: 64px;
          left: 84px;
        }
        #s-54 {
          top: 126px;
          left: 84px;
        }
        #s-55 {
          top: 157px;
          left: 84px;
        }
        #s-56 {
          top: 2px;
          left: 125px;
        }
        #s-57 {
          top: 33px;
          left: 125px;
        }
        #s-58 {
          top: 64px;
          left: 125px;
        }
        #s-59 {
          top: 126px;
          left: 125px;
        }
        #s-60 {
          top: 157px;
          left: 125px;
        }
        #s-61 {
          top: 2px;
          left: 166px;
        }
        #s-62 {
          top: 33px;
          left: 166px;
        }
        #s-63 {
          top: 64px;
          left: 166px;
        }
        #s-64 {
          top: 126px;
          left: 166px;
        }
        #s-65 {
          top: 157px;
          left: 166px;
        }
        #s-66 {
          top: 33px;
          left: 207px;
        }
        #s-67 {
          top: 64px;
          left: 207px;
        }
        #s-68 {
          top: 126px;
          left: 207px;
        }
        #s-69 {
          top: 157px;
          left: 207px;
        }
        #s-70 {
          top: 33px;
          left: 248px;
        }
        #s-71 {
          top: 64px;
          left: 248px;
        }
        #s-72 {
          top: 126px;
          left: 248px;
        }
        #s-73 {
          top: 157px;
          left: 248px;
        }
        #s-74 {
          top: 64px;
          left: 289px;
        }
        #s-75 {
          top: 126px;
          left: 289px;
        }
        #s-76 {
          top: 157px;
          left: 289px;
        }
        #s-77 {
          top: 64px;
          left: 330px;
        }
        #s-78 {
          top: 157px;
          left: 330px;
        }
        /* Level -1 */
        #s-79 {
          top: 126px;
          left: 289px;
        }
        #s-80 {
          top: 157px;
          left: 289px;
        }
        #el {
          top: 126px;
          left: 330px;
        }
        #s-81 {
          top: 157px;
          left: 330px;
        }
      `}</style>
    </div>
  );
}
