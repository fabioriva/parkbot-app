import { Level } from "~/components/map-level";
import "./wallstreet.css";

export default function Map({ data, view }: { data: any; view: any }) {
  // console.log(data);
  const levels = [...data.levels].reverse(); // Creates a copy and reverses it
  return (
    <div className="space-y-3">
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
