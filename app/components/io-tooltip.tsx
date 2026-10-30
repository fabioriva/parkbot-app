import type { ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { safeMessageT } from "~/lib/trans"
import type { DeviceData } from "~/components/device"
import { m } from "@paraglide/messages.js"
import "./io-tooltip.css"

interface IoTooltipProps {
  io?: DeviceData["c"][number] | null
  children: ReactNode
}

function get(label?: string) {
  switch (label) {
    case "AD1":
    case "AD2":
    case "AD3":
    case "AF7":
    case "AF8":
    case "DB32":
    case "FE12":
    case "K12":
    case "L1":
    case "L2":
    case "L3":
    case "L4":
    case "L5":
    case "RS12":
    case "RS3":
    case "RT12":
    case "S1":
    case "S2":
    case "T10":
    case "T2":
      return { key: label, query: {} }

    default:
      if (label) {
        let array = label.split("")
        const dash = array[array.length - 2]
        if (dash === "-") {
          const last = parseInt(array[array.length - 3])
          if (!isNaN(last)) {
            return {
              key: array.slice(0, -3).join("").concat("x"),
              query: { nr: last },
            }
          } else {
            return { key: label.slice(0, -2), query: {} }
          }
        }
        const last = parseInt(array[array.length - 1])
        if (!isNaN(last)) {
          return {
            key: array.slice(0, -1).join("").concat("x"),
            query: { nr: last },
          }
        } else {
          return { key: label, query: {} }
        }
      } else {
        return { key: "", query: {} }
      }
  }
}

export function IoTooltip({ io, children }: IoTooltipProps) {
  const { key, query } = get(io?.label)
  const status =
    io?.status === true || io?.status === 1
      ? "TRUE"
      : io?.status === false || io?.status === 0
        ? "FALSE"
        : "—"
  const messages: Readonly<Record<string, unknown>> = m
  const hasDescription =
    io?.label &&
    typeof (messages[`io.${key}`] || messages[`io_${key}`]) === "function"
  const description = hasDescription
    ? safeMessageT("io", key, query)
    : m.io_tooltip_no_description()
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={m.io_tooltip_trigger({
          label: io?.label || io?.addr || m.io_tooltip_title(),
          status: status === "—" ? m.io_tooltip_unavailable() : status,
        })}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className="io-tooltip">
        <div className="io-tooltip-body">
          <div className="io-tooltip-heading">
            <span
              className={io?.label ? "io-tooltip-label" : "io-tooltip-title"}
            >
              {io?.label || m.io_tooltip_title()}
            </span>
            <span className="io-tooltip-state" data-status={status}>
              <span className="sr-only">
                {m.io_tooltip_status()}
                {": "}
              </span>
              {status}
            </span>
          </div>
          <dl className="io-tooltip-address">
            <dt>{m.io_tooltip_address()}</dt>
            <dd>{io?.addr || "—"}</dd>
          </dl>
          <p className="io-tooltip-description">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
