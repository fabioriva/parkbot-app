import clsx from "clsx";

interface Sensor {
  addr: string;
  label: string;
  status: number;
}

interface SensorProps {
  x: string;
  y: string;
  sensor: Sensor;
}

interface SilomatProps {
  sensors: Sensor[];
}

const Sensor = ({ x, y, sensor }: SensorProps) => (
  <circle
    cx={x}
    cy={y}
    r="1.5"
    stroke-width="0.1"
    className={clsx({
      "fill-green-500 stroke-slate-600": sensor.status,
      "fill-slate-100 stroke-slate-600": !sensor.status,
    })}
  >
    <title className="bg-yellow-100">{`${sensor.label} ${sensor.addr} ${sensor.status ? "ON" : "OFF"}`}</title>
  </circle>
);

export function DeviceSilomat({ sensors }: SilomatProps) {
  // console.log(sensors);
  const [RMV, RMH, RES, REH, RCV, RAV, RAH, RCH] = sensors;
  return (
    <div className="svg-container w-full h-auto">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        // width="100%" title sty
        // height="100%"
        viewBox="0 0 100 40"
      >
        <image width="100%" href="/silomat.png" />
        <Sensor x="40" y="8" sensor={RMV} />
        <Sensor x="45" y="8" sensor={RMH} />
        <Sensor x="45" y="15" sensor={RES} />
        <Sensor x="45" y="20" sensor={REH} />
        <Sensor x="18.25" y="4" sensor={RAV} />
        <Sensor x="18.25" y="17.5" sensor={RCV} />
        <Sensor x="18.25" y="31" sensor={RAV} />
        <Sensor x="69.25" y="4" sensor={RAH} />
        <Sensor x="69.25" y="17.5" sensor={RCH} />
        <Sensor x="69.25" y="31" sensor={RAH} />
      </svg>
    </div>
  );
}
