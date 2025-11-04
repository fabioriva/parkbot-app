import { Level } from "~/components/map-level";

export default function Map({ data, view }: { data: any; view: any }) {
  return (
    <div className="space-y-3">
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
