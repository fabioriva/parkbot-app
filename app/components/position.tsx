import { useState, useEffect, useReducer } from "react";
import { Field, FieldLabel } from "~/components/ui/field";
import { Progress } from "~/components/ui/progress";

const initialState = {
  isRunning: false,
  destination: 0,
  position: 0,
  distance: 0,
  percent: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "start":
      return {
        ...state,
        isRunning: true,
        distance: Math.abs(action.destination - action.position),
        destination: action.destination,
        position: action.position,
        percent: 0,
      };
    case "reset":
      return initialState;

    case "tick":
      const actual = Math.abs(state.destination - action.position);
      const percent =
        actual <= 10 ? 100 : 100 - Math.round((actual * 100) / state.distance);
      return {
        ...state,
        percent,
      };
    default:
      throw new Error();
  }
}

const Item = ({ title, value }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-xs">{title}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export function Position({ encoder }) {
  const { destination, name, position } = encoder;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () => dispatch({ type: "start", destination, position }),
    [destination],
  );

  useEffect(() => {
    position === 0
      ? dispatch({ type: "reset" })
      : dispatch({ type: "tick", position });
  }, [position]);

  return (
    <div className="grid grid-cols-3 items-start">
      <Item title={name} value={position} />
      <Item title="Destination" value={destination} />
      {/* <Item title="Progress" value={`${Math.round(percent)} %`} /> */}
      <Field className="gap-1">
        <FieldLabel htmlFor="progress">
          <span className="text-muted-foreground text-xs">Progress</span>
          <span className="font-bold ml-auto">{state?.percent}%</span>
        </FieldLabel>
        <Progress
          className="*:data-[slot=progress-indicator]:bg-green-700"
          value={Math.round(state?.percent)}
          max={100}
        />
      </Field>
    </div>
  );
}
