import { m } from "@paraglide/messages.js"
import type { DeviceData } from "~/components/device"
import type { HistoryEntry } from "~/routes/aps/history"

const messages: Readonly<Record<string, unknown>> = m

export function deviceT(
  device: Pick<DeviceData, "card" | "mode" | "operation" | "stall" | "c">
): string {
  const { card, mode, operation, stall } = device
  const ce = (card: number, stall: number) => {
    if (card === 0 && stall === 0) return m.device_ce0()
    if (stall === 0) return m.device_ce1({ card })
    return m.device_ce2({ card, stall })
  }
  const cu = (card: number, stall: number) => {
    if (card === 0 && stall === 0) return m.device_cu0()
    if (stall === 0) return m.device_cu1({ card })
    return m.device_cu2({ card, stall })
  }
  const mv = (card: number, stall: number) => {
    if (card === 0 && stall === 0) return m.device_mv0()
    if (stall === 0) return m.device_mv1({ card })
    return m.device_mv2({ card, stall })
  }
  const pp = (stall: number) => {
    if (stall === 0) return m.device_pp0()
    return m.device_pp1({ stall })
  }
  if (!device.c[0].status) {
    return m.device_off()
  } else if (mode.id === 0) {
    return m["mode.mode-no"]()
  } else if (mode.id === 6) {
    return pp(stall)
  } else if (mode.id === 8 && operation === 1) {
    return ce(card, stall)
  } else if (mode.id === 8 && operation === 2) {
    return cu(card, stall)
  } else if (mode.id === 8 && operation === 3) {
    return m.device_idle0()
  } else if (mode.id === 8 && operation === 4) {
    return mv(card, stall)
  } else if (mode.id === 8) {
    return m.device_ready()
  } else {
    return m["mode.mode-man"]()
  }
}

export function logT(
  log: Pick<HistoryEntry, "alarm" | "card" | "operation" | "mode" | "stall">
): string | null {
  try {
    const { alarm, card, operation, mode, stall } = log
    switch (operation.id) {
      case 1:
      case 2: {
        if (!alarm) return null
        const fn = messages["alarm." + alarm.key]
        return typeof fn === "function" ? fn({ ...alarm.query }) : null
      }
      case 3:
        return m.log_id_3({ id: mode.id })
      case 4:
        return m.log_id_4({ card })
      case 5:
        return m.log_id_5({ card, stall })
      case 6:
        return m.log_id_6({ card, stall })
      case 7:
        return m.log_id_7({ card, stall })
      case 8:
        return m.log_id_8({ card, stall })
      case 9:
        return m.log_id_9({ stall })
      case 10:
        return m.log_id_10({ card })
      case 11:
        return m.log_id_11({ card })
      case 12:
        return m.log_id_12({ card })
      case 13:
        return m.log_id_13({ card })
      case 14:
        return m.log_id_14({ card })
      default:
        return `Operation ${operation.id}`
    }
  } catch {
    return null
  }
}

export function safeMessageT(
  prefix: string,
  key: string | null | undefined,
  params: Record<string, unknown> = {}
): string {
  const fn = messages[`${prefix}.${key}`] || messages[`${prefix}_${key}`]

  if (typeof fn !== "function") {
    // Chiave non presente → ritorna fallback
    return `Missing translation: ${prefix}.${key ?? ""}`
  }

  return fn(params)
}
