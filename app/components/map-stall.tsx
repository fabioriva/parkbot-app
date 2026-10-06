import { useLoaderData, useOutletContext, useParams } from "react-router"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { useEditStallDialog } from "~/components/map-edit"
import { usePlantTimeZone } from "~/hooks/use-plant-time-zone"
import { actionResponse } from "~/lib/action"
import { formatPlantDateTime } from "~/lib/date-time"
import { m } from "@paraglide/messages.js"
import { clsx } from "cn"

import type { loader } from "~/routes/aps/map"

interface StallProps {
  definitions: {
    cards: number
    stallStatus: {
      FREE: number
      LOCK: number
      PAPA: number
      RSVD: number
    }
  }
  stall: {
    date: Date | string
    nr: string | number
    size: string | number
    status: number
  }
  view: "view0" | "view1" | "view2" | "view3"
}

export function Stall({ definitions, stall, view }: StallProps) {
  const data = useLoaderData<typeof loader>()
  const params = useParams()
  const { user } = useOutletContext<{ user: { role: string } }>()
  const { showEditDialog } = useEditStallDialog()
  const { date, nr, size, status } = stall
  const timeZone = usePlantTimeZone()
  const formattedDate = timeZone
    ? formatPlantDateTime(date, timeZone, "dd/MM/yyyy HH:mm:ss xxx")
    : "—"
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus
  const isEditable = user?.role === "admin" || user?.role === "service"

  const handleConfirm = async (value: number) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/map/edit`
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ card: value, stall: nr }),
    })
    actionResponse(res)
  }

  const handleStallClick = () => {
    if (!isEditable) return

    showEditDialog({
      definitions,
      stall,
      onConfirm: (value) => handleConfirm(value),
    })
  }

  const stallClasses = clsx(
    "absolute flex h-7.5 w-10 items-center justify-center border text-xs",
    {
      "pointer-events-none opacity-60": !isEditable,
      "hover:cursor-pointer": isEditable,
      "bg-red-300 text-red-950 dark:bg-red-950 dark:text-red-300":
        status !== 0 && status !== LOCK && status !== PAPA && status !== RSVD,
      "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300":
        status === FREE,
      "bg-purple-300 text-purple-950 dark:bg-purple-950 dark:text-purple-300":
        status === LOCK,
      "bg-blue-300 text-blue-950 dark:bg-blue-950 dark:text-blue-300":
        status === PAPA,
      "bg-amber-300 text-amber-950 dark:bg-amber-950 dark:text-amber-300":
        status === RSVD,
    }
  )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={stallClasses}
            id={"s-" + nr}
            onClick={handleStallClick}
          >
            {view === "view0" && status === LOCK && (
              <span className="text-xl">🔒</span>
            )}
            {view === "view0" && status === PAPA && (
              <span className="text-xl">🚗</span>
            )}
            {view === "view0" && status === RSVD && (
              <span className="text-xl">🚗</span>
            )}
            {view === "view0" &&
              status !== LOCK &&
              status !== PAPA &&
              status !== RSVD &&
              status !== 0 && <span className="text-xl">🚗</span>}
            {view === "view1" && status}
            {view === "view2" && nr}
            {view === "view3" && size}
          </div>
        }
      />
      <TooltipContent className="text-center text-sm">
        {status === 0
          ? m.map_stall_free({ date: formattedDate, nr })
          : status === LOCK
            ? m.map_stall_lock({ date: formattedDate, nr })
            : m.map_stall_busy({ date: formattedDate, nr, status })}
      </TooltipContent>
    </Tooltip>
  )
}
