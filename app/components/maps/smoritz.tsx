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
        .el {
          height: 30px;
          width: 40px;
        }
        #el-l {
          top: 2px;
          left: 2px;
        }
        #s-9 {
          top: 33px;
          left: 2px;
        }
        #s-1 {
          top: 2px;
          left: 43px;
        }
        #s-2 {
          top: 2px;
          left: 84px;
        }
        #s-3 {
          top: 2px;
          left: 125px;
        }
        #s-4 {
          top: 2px;
          left: 166px;
        }
        #s-5 {
          top: 64px;
          left: 43px;
        }
        #s-6 {
          top: 64px;
          left: 84px;
        }
        #s-7 {
          top: 64px;
          left: 125px;
        }
        #s-8 {
          top: 64px;
          left: 166px;
        }
        #s-10 {
          top: 33px;
          left: 207px;
        }
        #el-r {
          top: 2px;
          left: 207px;
        }
      `}</style>
    </div>
  );
}
