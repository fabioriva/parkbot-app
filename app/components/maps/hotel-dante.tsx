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
          height: 67px;
          width: 374px;
        }
        #el {
          top: 33px;
          left: 2px;
        }
        #s-1 {
          top: 2px;
          left: 2px;
        }
        #s-2 {
          top: 2px;
          left: 43px;
        }
        #s-3 {
          top: 2px;
          left: 84px;
        }
        #s-4 {
          top: 2px;
          left: 125px;
        }
        #s-5 {
          top: 2px;
          left: 166px;
        }
        #s-6 {
          top: 2px;
          left: 207px;
        }
        #s-7 {
          top: 2px;
          left: 248px;
        }
        #s-8 {
          top: 2px;
          left: 289px;
        }
        #s-9 {
          top: 2px;
          left: 330px;
        }

        #s-10 {
          top: 2px;
          left: 2px;
        }
        #s-11 {
          top: 2px;
          left: 43px;
        }
        #s-12 {
          top: 2px;
          left: 84px;
        }
        #s-13 {
          top: 2px;
          left: 125px;
        }
        #s-14 {
          top: 2px;
          left: 166px;
        }
        #s-15 {
          top: 2px;
          left: 207px;
        }
        #s-16 {
          top: 2px;
          left: 248px;
        }
        #s-17 {
          top: 2px;
          left: 289px;
        }
        #s-18 {
          top: 2px;
          left: 330px;
        }

        #s-19 {
          top: 2px;
          left: 2px;
        }
        #s-20 {
          top: 2px;
          left: 43px;
        }
        #s-21 {
          top: 2px;
          left: 84px;
        }
        #s-22 {
          top: 2px;
          left: 125px;
        }
        #s-23 {
          top: 2px;
          left: 166px;
        }
        #s-24 {
          top: 2px;
          left: 207px;
        }
        #s-25 {
          top: 2px;
          left: 248px;
        }
        #s-26 {
          top: 2px;
          left: 289px;
        }
        #s-27 {
          top: 2px;
          left: 330px;
        }

        #s-28 {
          top: 2px;
          left: 84px;
        }
        #s-29 {
          top: 2px;
          left: 125px;
        }
        #s-30 {
          top: 2px;
          left: 166px;
        }
        #s-31 {
          top: 2px;
          left: 207px;
        }
        #s-32 {
          top: 2px;
          left: 248px;
        }
        #s-33 {
          top: 2px;
          left: 289px;
        }
        #s-34 {
          top: 2px;
          left: 330px;
        }

        #s-35 {
          top: 2px;
          left: 2px;
        }
        #s-36 {
          top: 2px;
          left: 43px;
        }
        #s-37 {
          top: 2px;
          left: 84px;
        }
        #s-38 {
          top: 2px;
          left: 125px;
        }
        #s-39 {
          top: 2px;
          left: 166px;
        }
        #s-40 {
          top: 2px;
          left: 207px;
        }
        #s-41 {
          top: 2px;
          left: 248px;
        }
        #s-42 {
          top: 2px;
          left: 289px;
        }
        #s-43 {
          top: 2px;
          left: 330px;
        }

        #s-44 {
          top: 2px;
          left: 2px;
        }
        #s-45 {
          top: 2px;
          left: 43px;
        }
        #s-46 {
          top: 2px;
          left: 84px;
        }
        #s-47 {
          top: 2px;
          left: 125px;
        }
        #s-48 {
          top: 2px;
          left: 166px;
        }
        #s-49 {
          top: 2px;
          left: 207px;
        }
        #s-50 {
          top: 2px;
          left: 248px;
        }
        #s-51 {
          top: 2px;
          left: 289px;
        }
        #s-52 {
          top: 2px;
          left: 330px;
        }
      `}</style>
    </div>
  );
}
