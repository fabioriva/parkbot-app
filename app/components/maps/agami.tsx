import { Level } from "~/components/map-level";

export default function Map({ data, view }) {
  const levels = [...data.levels].reverse(); // Creates a copy and reverses it
  const jsx = () => {
    let levels = [];
    let offset = 0;
    for (let i = 1; i < 29; i++) {
      const p = `
      #s-${3 + offset}  {
        top: 2px;
        left: 2px;
      }
      #s-${5 + offset}  {
        top: 2px;
        left: 43px;
      }
      #s-${4 + offset}  {
        top: 64px;
        left: 2px;
      }
      #s-${6 + offset}  {
        top: 64px;
        left: 43px;
      }`;
      levels.push(p);
      offset += 4;
    }
    return levels.join(" ");
  };
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
          height: 99px;
          width: 87px;
        }
        #el-1 {
          top: 33px;
          left: 2px;
        }
        {* P1 *}
        #s-1 {
          top: 2px;
          left: 2px;
        }
        #s-2 {
          top: 2px;
          left: 43px;
        }
        {* P2 - P28 *}
        ${jsx()}
      `}</style>
    </div>
  );
}
