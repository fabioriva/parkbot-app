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
          height: 98px;
          width: 251px;
        }
        #el {
          top: 33px;
          left: 2px;
        }
        /* P1 */
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
          top: 2px;
          left: 84px;
        }
        #s-6 {
          top: 64px;
          left: 84px;
        }
        #s-7 {
          top: 2px;
          left: 125px;
        }
        #s-8 {
          top: 64px;
          left: 125px;
        }
        #s-9 {
          top: 64px;
          left: 166px;
        }
        #s-10 {
          top: 64px;
          left: 207px;
        }
        /* P2 */
        #s-11 {
          top: 2px;
          left: 2px;
        }
        #s-12 {
          top: 64px;
          left: 2px;
        }
        #s-13 {
          top: 2px;
          left: 43px;
        }
        #s-14 {
          top: 64px;
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
          top: 2px;
          left: 125px;
        }
        #s-18 {
          top: 64px;
          left: 125px;
        }
        #s-19 {
          top: 64px;
          left: 166px;
        }
        #s-20 {
          top: 64px;
          left: 207px;
        }
        /* P3 */
        #s-21 {
          top: 2px;
          left: 2px;
        }
        #s-22 {
          top: 64px;
          left: 2px;
        }
        #s-23 {
          top: 2px;
          left: 43px;
        }
        #s-24 {
          top: 64px;
          left: 43px;
        }
        #s-25 {
          top: 2px;
          left: 84px;
        }
        #s-26 {
          top: 64px;
          left: 84px;
        }
        #s-27 {
          top: 2px;
          left: 125px;
        }
        #s-28 {
          top: 64px;
          left: 125px;
        }
        /* P4 */
        #s-29 {
          top: 2px;
          left: 2px;
        }
        #s-30 {
          top: 2px;
          left: 43px;
        }
        #s-31 {
          top: 2px;
          left: 84px;
        }
        #s-32 {
          top: 2px;
          left: 125px;
        }
        /* P5 */
        #s-33 {
          top: 2px;
          left: 2px;
        }
        #s-34 {
          top: 64px;
          left: 2px;
        }
        #s-35 {
          top: 2px;
          left: 43px;
        }
        #s-36 {
          top: 64px;
          left: 43px;
        }
        #s-37 {
          top: 2px;
          left: 84px;
        }
        #s-38 {
          top: 64px;
          left: 84px;
        }
        #s-39 {
          top: 2px;
          left: 125px;
        }
        #s-40 {
          top: 64px;
          left: 125px;
        }
        /* P6 */
        #s-41 {
          top: 2px;
          left: 2px;
        }
        #s-42 {
          top: 64px;
          left: 2px;
        }
        #s-43 {
          top: 2px;
          left: 43px;
        }
        #s-44 {
          top: 64px;
          left: 43px;
        }
        #s-45 {
          top: 2px;
          left: 84px;
        }
        #s-46 {
          top: 64px;
          left: 84px;
        }
        #s-47 {
          top: 2px;
          left: 125px;
        }
        #s-48 {
          top: 64px;
          left: 125px;
        }
        /* P7 */
        #s-49 {
          top: 2px;
          left: 2px;
        }
        #s-50 {
          top: 64px;
          left: 2px;
        }
        #s-51 {
          top: 2px;
          left: 43px;
        }
        #s-52 {
          top: 64px;
          left: 43px;
        }
        #s-53 {
          top: 2px;
          left: 84px;
        }
        #s-54 {
          top: 64px;
          left: 84px;
        }
        #s-55 {
          top: 2px;
          left: 125px;
        }
        #s-56 {
          top: 64px;
          left: 125px;
        }
        /* P8 */
        #s-57 {
          top: 2px;
          left: 2px;
        }
        #s-58 {
          top: 64px;
          left: 2px;
        }
        #s-59 {
          top: 2px;
          left: 43px;
        }
        #s-60 {
          top: 64px;
          left: 43px;
        }
        #s-61 {
          top: 2px;
          left: 84px;
        }
        #s-62 {
          top: 64px;
          left: 84px;
        }
        #s-63 {
          top: 2px;
          left: 125px;
        }
        #s-64 {
          top: 64px;
          left: 125px;
        }
        /* P9 */
        #s-65 {
          top: 2px;
          left: 2px;
        }
        #s-66 {
          top: 64px;
          left: 2px;
        }
        #s-67 {
          top: 2px;
          left: 43px;
        }
        #s-68 {
          top: 64px;
          left: 43px;
        }
        #s-69 {
          top: 2px;
          left: 84px;
        }
        #s-70 {
          top: 64px;
          left: 84px;
        }
        #s-71 {
          top: 2px;
          left: 125px;
        }
        #s-72 {
          top: 64px;
          left: 125px;
        }
        /* P10 */
        #s-73 {
          top: 2px;
          left: 2px;
        }
        #s-74 {
          top: 64px;
          left: 2px;
        }
        #s-75 {
          top: 2px;
          left: 43px;
        }
        #s-76 {
          top: 64px;
          left: 43px;
        }
        #s-77 {
          top: 2px;
          left: 84px;
        }
        #s-78 {
          top: 64px;
          left: 84px;
        }
        #s-79 {
          top: 2px;
          left: 125px;
        }
        #s-80 {
          top: 64px;
          left: 125px;
        }
      `}</style>
    </div>
  );
}
