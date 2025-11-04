import { Level } from "~/components/map-level";
import "./bugrashov.css";

export default function Map({ data, view }: { data: any; view: any }) {
  return (
    <div className="overflow-auto space-y-3">
      {data?.levels.map((level) => (
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
