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
          width: 87px;
        }
        /* Level +1 */
        #el-a1 {
          top: 64px;
          left: 2px;
        }
        #s-1 {
          top: 126px;
          left: 2px;
        }
        #s-2 {
          top: 95px;
          left: 2px;
        }
        #s-3 {
          top: 33px;
          left: 2px;
        }
        #s-4 {
          top: 2px;
          left: 2px;
        }
        #s-5 {
          top: 126px;
          left: 43px;
        }
        #s-6 {
          top: 95px;
          left: 43px;
        }
        #s-7 {
          top: 33px;
          left: 43px;
        }
        #s-8 {
          top: 2px;
          left: 43px;
        }
        /* Level +2 */
        #el-a2 {
          top: 64px;
          left: 2px;
        }
        #s-9 {
          top: 126px;
          left: 2px;
        }
        #s-10 {
          top: 95px;
          left: 2px;
        }
        #s-11 {
          top: 33px;
          left: 2px;
        }
        #s-12 {
          top: 2px;
          left: 2px;
        }
        #s-13 {
          top: 126px;
          left: 43px;
        }
        #s-14 {
          top: 95px;
          left: 43px;
        }
        #s-15 {
          top: 33px;
          left: 43px;
        }
        #s-16 {
          top: 2px;
          left: 43px;
        }
        /* Level +3 */
        #el-a3 {
          top: 64px;
          left: 2px;
        }
        #s-17 {
          top: 126px;
          left: 2px;
        }
        #s-18 {
          top: 95px;
          left: 2px;
        }
        #s-19 {
          top: 33px;
          left: 2px;
        }
        #s-20 {
          top: 2px;
          left: 2px;
        }
        #s-21 {
          top: 126px;
          left: 43px;
        }
        #s-22 {
          top: 95px;
          left: 43px;
        }
        #s-23 {
          top: 33px;
          left: 43px;
        }
        #s-24 {
          top: 2px;
          left: 43px;
        }
        /* Level +4 */
        #el-a4 {
          top: 64px;
          left: 2px;
        }
        #s-25 {
          top: 126px;
          left: 2px;
        }
        #s-26 {
          top: 95px;
          left: 2px;
        }
        #s-27 {
          top: 33px;
          left: 2px;
        }
        #s-28 {
          top: 2px;
          left: 2px;
        }
        #s-29 {
          top: 126px;
          left: 43px;
        }
        #s-30 {
          top: 95px;
          left: 43px;
        }
        #s-31 {
          top: 33px;
          left: 43px;
        }
        #s-32 {
          top: 2px;
          left: 43px;
        }
        /* Level +5 */
        #el-a5 {
          top: 64px;
          left: 2px;
        }
        #s-33 {
          top: 126px;
          left: 2px;
        }
        #s-34 {
          top: 95px;
          left: 2px;
        }
        #s-35 {
          top: 33px;
          left: 2px;
        }
        #s-36 {
          top: 2px;
          left: 2px;
        }
        #s-37 {
          top: 126px;
          left: 43px;
        }
        #s-38 {
          top: 95px;
          left: 43px;
        }
        #s-39 {
          top: 33px;
          left: 43px;
        }
        #s-40 {
          top: 2px;
          left: 43px;
        }
        /* Level +6 */
        #el-a6 {
          top: 64px;
          left: 2px;
        }
        #s-41 {
          top: 126px;
          left: 2px;
        }
        #s-42 {
          top: 95px;
          left: 2px;
        }
        #s-43 {
          top: 33px;
          left: 2px;
        }
        #s-44 {
          top: 2px;
          left: 2px;
        }
        #s-45 {
          top: 126px;
          left: 43px;
        }
        #s-46 {
          top: 95px;
          left: 43px;
        }
        #s-47 {
          top: 33px;
          left: 43px;
        }
        #s-48 {
          top: 2px;
          left: 43px;
        }
        /* Level +7 */
        #el-a7 {
          top: 64px;
          left: 2px;
        }
        #s-49 {
          top: 126px;
          left: 2px;
        }
        #s-50 {
          top: 95px;
          left: 2px;
        }
        #s-51 {
          top: 33px;
          left: 2px;
        }
        #s-52 {
          top: 2px;
          left: 2px;
        }
        #s-53 {
          top: 126px;
          left: 43px;
        }
        #s-54 {
          top: 95px;
          left: 43px;
        }
        #s-55 {
          top: 33px;
          left: 43px;
        }
        #s-56 {
          top: 2px;
          left: 43px;
        }
      `}</style>
    </div>
  );
}
