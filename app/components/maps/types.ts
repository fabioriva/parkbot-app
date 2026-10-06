import type { ComponentProps } from "react"
import type { Level } from "~/components/map-level"

type LevelProps = ComponentProps<typeof Level>

export interface MapProps {
  data: {
    definitions: LevelProps["definitions"]
    levels: LevelProps["level"][]
  }
  view: LevelProps["view"]
}
