import { Sensor } from "~/components/digital-io-svg";

import type { Bit } from "~/routes/aps/types";

interface SilomatProps {
  sensors: Bit[];
}

export function DeviceSilomat({ sensors }: SilomatProps) {
  // console.log(sensors);
  const [RMV, RMH, RES, REH, RCV, RAV, RAH, RCH] = sensors;
  return (
    <div className="svg-container border p-1">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 50"
      >
        <image width="100%" height="100%" href="/silomat.png" />
        <Sensor x="40" y="16" sensor={RMV} />
        <Sensor x="45" y="16" sensor={RMH} />
        <Sensor x="45" y="23" sensor={RES} />
        <Sensor x="45" y="27" sensor={REH} />
        <Sensor x="18.5" y="10" sensor={RAV} />
        <Sensor x="18.5" y="25" sensor={RCV} />
        <Sensor x="18.5" y="40" sensor={RAV} />
        <Sensor x="69.5" y="10" sensor={RAH} />
        <Sensor x="69.5" y="25" sensor={RCH} />
        <Sensor x="69.5" y="40" sensor={RAH} />
      </svg>
    </div>
  );
}
