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
      <style jsx>{`
        .l {
          height: 160px;
          width: 1153px;
        }
        #el-1 {
          top: 95px;
          left: 207px;
        }
        #el-2 {
          top: 95px;
          left: 289px;
        }
        #el-3 {
          top: 95px;
          left: 371px;
        }
        #el-4 {
          top: 95px;
          left: 453px;
        }
        #el-5 {
          top: 95px;
          left: 535px;
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
          top: 95px;
          left: 2px;
        }
        #s-4 {
          top: 126px;
          left: 2px;
        }
        #s-5 {
          top: 2px;
          left: 43px;
        }
        #s-6 {
          top: 33px;
          left: 43px;
        }
        #s-7 {
          top: 95px;
          left: 43px;
        }
        #s-8 {
          top: 126px;
          left: 43px;
        }
        #s-9 {
          top: 2px;
          left: 84px;
        }
        #s-10 {
          top: 33px;
          left: 84px;
        }
        #s-11 {
          top: 95px;
          left: 84px;
        }
        #s-12 {
          top: 126px;
          left: 84px;
        }
        #s-13 {
          top: 2px;
          left: 125px;
        }
        #s-14 {
          top: 33px;
          left: 125px;
        }
        #s-15 {
          top: 95px;
          left: 125px;
        }
        #s-16 {
          top: 126px;
          left: 125px;
        }
        #s-17 {
          top: 2px;
          left: 166px;
        }
        #s-18 {
          top: 33px;
          left: 166px;
        }
        #s-19 {
          top: 95px;
          left: 166px;
        }
        #s-20 {
          top: 126px;
          left: 166px;
        }
        #s-21 {
          top: 2px;
          left: 207px;
        }
        #s-22 {
          top: 33px;
          left: 207px;
        }
        #s-23 {
          top: 2px;
          left: 248px;
        }
        #s-24 {
          top: 33px;
          left: 248px;
        }
        #s-25 {
          top: 95px;
          left: 248px;
        }
        #s-26 {
          top: 126px;
          left: 248px;
        }
        #s-27 {
          top: 2px;
          left: 289px;
        }
        #s-28 {
          top: 33px;
          left: 289px;
        }
        #s-29 {
          top: 2px;
          left: 330px;
        }
        #s-30 {
          top: 33px;
          left: 330px;
        }
        #s-31 {
          top: 95px;
          left: 330px;
        }
        #s-32 {
          top: 126px;
          left: 330px;
        }
        #s-33 {
          top: 2px;
          left: 371px;
        }
        #s-34 {
          top: 33px;
          left: 371px;
        }
        #s-35 {
          top: 2px;
          left: 412px;
        }
        #s-36 {
          top: 33px;
          left: 412px;
        }
        #s-37 {
          top: 95px;
          left: 412px;
        }
        #s-38 {
          top: 126px;
          left: 412px;
        }
        #s-39 {
          top: 2px;
          left: 453px;
        }
        #s-40 {
          top: 33px;
          left: 453px;
        }
        #s-41 {
          top: 2px;
          left: 494px;
        }
        #s-42 {
          top: 33px;
          left: 494px;
        }
        #s-43 {
          top: 95px;
          left: 494px;
        }
        #s-44 {
          top: 126px;
          left: 494px;
        }
        #s-45 {
          top: 2px;
          left: 535px;
        }
        #s-46 {
          top: 33px;
          left: 535px;
        }
        #s-47 {
          top: 2px;
          left: 576px;
        }
        #s-48 {
          top: 33px;
          left: 576px;
        }
        #s-49 {
          top: 95px;
          left: 576px;
        }
        #s-50 {
          top: 126px;
          left: 576px;
        }
        #s-51 {
          top: 2px;
          left: 617px;
        }
        #s-52 {
          top: 33px;
          left: 617px;
        }
        #s-53 {
          top: 2px;
          left: 658px;
        }
        #s-54 {
          top: 33px;
          left: 658px;
        }
        #s-55 {
          top: 2px;
          left: 699px;
        }
        #s-56 {
          top: 33px;
          left: 699px;
        }
        #s-57 {
          top: 95px;
          left: 699px;
        }
        #s-58 {
          top: 2px;
          left: 740px;
        }
        #s-59 {
          top: 33px;
          left: 740px;
        }
        #s-60 {
          top: 95px;
          left: 740px;
        }
        #s-61 {
          top: 95px;
          left: 781px;
        }
        #s-62 {
          top: 2px;
          left: 822px;
        }
        #s-63 {
          top: 33px;
          left: 822px;
        }
        #s-64 {
          top: 95px;
          left: 822px;
        }
        #s-65 {
          top: 2px;
          left: 863px;
        }
        #s-66 {
          top: 33px;
          left: 863px;
        }
        #s-67 {
          top: 95px;
          left: 863px;
        }
        #s-68 {
          top: 95px;
          left: 904px;
        }
        #s-69 {
          top: 2px;
          left: 945px;
        }
        #s-70 {
          top: 33px;
          left: 945px;
        }
        #s-71 {
          top: 95px;
          left: 945px;
        }
        #s-72 {
          top: 126px;
          left: 945px;
        }
        #s-69 {
          top: 2px;
          left: 945px;
        }
        #s-70 {
          top: 33px;
          left: 945px;
        }
        #s-71 {
          top: 95px;
          left: 945px;
        }
        #s-72 {
          top: 126px;
          left: 945px;
        }
        #s-73 {
          top: 2px;
          left: 986px;
        }
        #s-74 {
          top: 33px;
          left: 986px;
        }
        #s-75 {
          top: 95px;
          left: 986px;
        }
        #s-76 {
          top: 126px;
          left: 986px;
        }
        #s-77 {
          top: 2px;
          left: 1027px;
        }
        #s-78 {
          top: 33px;
          left: 1027px;
        }
        #s-79 {
          top: 95px;
          left: 1027px;
        }
        #s-80 {
          top: 126px;
          left: 1027px;
        }
        #s-81 {
          top: 2px;
          left: 1068px;
        }
        #s-82 {
          top: 33px;
          left: 1068px;
        }
        #s-83 {
          top: 95px;
          left: 1068px;
        }
        #s-84 {
          top: 126px;
          left: 1068px;
        }
        #s-85 {
          top: 2px;
          left: 1109px;
        }
        #s-86 {
          top: 33px;
          left: 1109px;
        }
        #s-87 {
          top: 95px;
          left: 1109px;
        }
        #s-88 {
          top: 126px;
          left: 1109px;
        }
      `}</style>
    </div>
  );
}
