import { useEffect, useReducer } from "react"
import type { DeviceData } from "~/components/device"
import { Field, FieldLabel } from "~/components/ui/field"
import { Progress } from "~/components/ui/progress"
import { m } from "@paraglide/messages.js"

interface PositionProps {
  encoder: NonNullable<
    DeviceData["views"][number]["motors"][number]["encoders"]
  >[number]
}

interface ItemProps {
  title: string
  value: number
}

const initialState = {
  isRunning: false,
  destination: 0,
  position: 0,
  distance: 0,
  percent: 0,
}

type PositionState = typeof initialState

type PositionAction =
  | { type: "start"; destination: number; position: number }
  | { type: "reset" }
  | { type: "tick"; position: number }

function reducer(state: PositionState, action: PositionAction): PositionState {
  switch (action.type) {
    case "start":
      return {
        ...state,
        isRunning: true,
        distance: Math.abs(action.destination - action.position),
        destination: action.destination,
        position: action.position,
        percent: 0,
      }
    case "reset":
      return initialState

    case "tick":
      const actual = Math.abs(state.destination - action.position)
      const percent =
        actual <= 10 ? 100 : 100 - Math.round((actual * 100) / state.distance)
      return {
        ...state,
        percent,
      }
    default:
      throw new Error()
  }
}

const Item = ({ title, value }: ItemProps) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{title}</span>
    <span className="font-bold">{value}</span>
  </div>
)

export function Position({ encoder }: PositionProps) {
  const { destination, name, position } = encoder
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(
    () => dispatch({ type: "start", destination, position }),
    [destination]
  )

  useEffect(() => {
    position === 0
      ? dispatch({ type: "reset" })
      : dispatch({ type: "tick", position })
  }, [position])

  return (
    <div className="grid grid-cols-3 items-start">
      <Item title={name} value={position} />
      <Item title={m.device_pos_destination()} value={destination} />
      {/* <Item title={m.device_pos_progress()} value={`${Math.round(percent)} %`} /> */}
      <Field className="gap-1">
        <FieldLabel htmlFor="progress">
          <span className="text-xs text-muted-foreground">
            {m.device_pos_progress()}
          </span>
          <span className="ml-auto font-bold">{state?.percent}%</span>
        </FieldLabel>
        <Progress
          className="*:data-[slot=progress-indicator]:bg-green-700"
          value={Math.round(state?.percent)}
          max={100}
        />
      </Field>
    </div>
  )
}
