import * as React from "react";
import { Progress } from "~/components/ui/progress";

interface DevicePositionProps {
  position: object;
}

const initialState = {
  isRunning: false,
  destination: 0,
  position: 0,
  distance: 0,
  percent: 0,
};

function reducer(progress, action) {
  switch (action.type) {
    case "start":
      // console.log("start", progress, action);
      return {
        ...progress,
        isRunning: true,
        distance: Math.abs(action.destination - action.position),
        destination: action.destination,
        position: action.position,
        percent: 0,
      };
    case "reset":
      return initialState;

    case "tick":
      // console.log("tick", progress, action);
      const actual = Math.abs(progress.destination - action.position);
      const percent =
        actual <= 10
          ? 100
          : 100 - Math.round((actual * 100) / progress.distance);
      return {
        ...progress,
        percent,
      };
    default:
      throw new Error();
  }
}

export function DevicePosition({ encoder }: DevicePositionProps) {
  // console.log(encoder);
  const { destination, position } = encoder;
  const [progress, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(
    () => dispatch({ type: "start", destination, position }),
    [destination]
  );

  React.useEffect(() => {
    position === 0
      ? dispatch({ type: "reset" })
      : dispatch({ type: "tick", position });
  }, [position]);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex">
        <span className="grow">{encoder.name}</span>
        <span>
          {position}&nbsp;&rarr;&nbsp;{destination}
        </span>
      </div>
      <Progress value={progress.percent} />
    </div>
  );
}
