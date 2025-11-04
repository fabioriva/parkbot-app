import { Level } from "~/components/map-level";
import "./menloa.css";

export default function Map({ data, view }: { data: any; view: any }) {
  const levels = [...data.levels].reverse(); // Creates a copy and reverses it
  return (
    <div className="overflow-auto space-y-3">
      {levels.map((level) => (
        <Level
          definitions={data?.definitions}
          level={level}
          view={view}
          key={level.nr}
        />
      ))}
    </div>
  );
}
