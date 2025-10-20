import { Sensor } from "~/components/digital-io-svg";

import type { Bit } from "~/routes/aps/types";

interface VgProps {
  sensors: Bit[];
}
export function DeviceVg({ sensors }: VgProps) {
  // console.log(sensors);
  const [FRE, FPE, FLA, FLP, FDR, FDL] = sensors;
  return (
    <div className="svg-container border p-1">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 50"
      >
        <image width="100%" height="100%" href="/car.png" />
        <Sensor x="80" y="45" sensor={FRE} />
        <Sensor x="45" y="25" sensor={FPE} />
        <Sensor x="97" y="25" sensor={FLA} />
        <Sensor x="3" y="25" sensor={FLP} />
        <Sensor x="45" y="45" sensor={FDR} />
        <Sensor x="45" y="5" sensor={FDL} />
      </svg>
    </div>
  );
}
