import { m } from "@paraglide/messages.js"
import { baseLocale, locales } from "@paraglide/runtime.js"

type Locale = (typeof locales)[number]
type Parameters = Record<string, string | number>

export interface AlarmNotification {
  eventId: string
  aps: string
  recipients: { email: string; locale?: string }[]
  alarmLog: {
    operation: { id: number }
    alarm: { id: number; key: string; query?: Parameters }
    device: { id: number; name: string }
    date: string
  }
}

export interface NotificationEmail {
  to: string
  subject: string
  text: string
  html: string
}

export interface NotificationDependencies {
  /** Validate service credentials and return the authorized installation. */
  authenticate: (request: Request) => Promise<{ aps: string } | null>
  /** Must reject on delivery failure; resolving means provider acceptance. */
  sendEmail: (email: NotificationEmail) => Promise<unknown>
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 500

const isId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0

/** Validate external JSON before rendering or sending any messages. */
export function parseAlarmNotification(value: unknown): AlarmNotification {
  if (
    !isObject(value) ||
    !isText(value.eventId) ||
    !isText(value.aps) ||
    /[\r\n]/.test(value.aps) ||
    !Array.isArray(value.recipients) ||
    value.recipients.length === 0 ||
    value.recipients.length > 100
  ) {
    throw new Error("Invalid eventId, aps or recipients (1–100 required)")
  }

  const recipients = value.recipients.map((recipient) => {
    if (
      !isObject(recipient) ||
      !isText(recipient.email) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient.email) ||
      (recipient.locale !== undefined && !isText(recipient.locale))
    ) {
      throw new Error("Invalid recipient email or locale")
    }
    return {
      email: recipient.email,
      locale: recipient.locale as string | undefined,
    }
  })

  const log = value.alarmLog
  if (
    !isObject(log) ||
    !isObject(log.operation) ||
    !isId(log.operation.id) ||
    !isObject(log.alarm) ||
    !isId(log.alarm.id) ||
    !isText(log.alarm.key) ||
    !isObject(log.device) ||
    !isId(log.device.id) ||
    !isText(log.device.name) ||
    /[\r\n]/.test(log.device.name) ||
    typeof log.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      log.date
    ) ||
    !Number.isFinite(Date.parse(log.date))
  ) {
    throw new Error("Invalid alarmLog; date must include a timezone")
  }

  const query = log.alarm.query ?? {}
  if (
    !isObject(query) ||
    !Object.values(query).every(
      (value) =>
        (typeof value === "string" && value.length <= 2000) ||
        (typeof value === "number" && Number.isFinite(value))
    )
  ) {
    throw new Error("Alarm parameters must be strings or finite numbers")
  }

  return {
    eventId: value.eventId,
    aps: value.aps,
    recipients,
    alarmLog: {
      operation: { id: log.operation.id },
      alarm: {
        id: log.alarm.id,
        key: log.alarm.key,
        query: query as Parameters,
      },
      device: { id: log.device.id, name: log.device.name },
      date: log.date,
    },
  }
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

/** Uses existing Paraglide messages only; no global locale changes. */
export function composeNotificationEmail(
  notification: AlarmNotification,
  recipient: AlarmNotification["recipients"][number]
): NotificationEmail {
  const locale =
    locales.find((locale) => locale === recipient.locale) ?? baseLocale
  const options = { locale }
  const { alarm, device, date } = notification.alarmLog
  const key = `alarm.${alarm.key}`
  const messages = m as unknown as Record<
    string,
    (inputs: Parameters, options: { locale: Locale }) => string
  >
  let description: string = m["alarm.al-id"]({ id: alarm.id }, options)
  if (Object.hasOwn(messages, key) && typeof messages[key] === "function") {
    try {
      description = messages[key](alarm.query ?? {}, options)
    } catch {
      // Keep the alarm identifier if the message function cannot render.
    }
  }
  const title = m.log_id_1({ id: alarm.id }, options)
  const timestamp = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date))
  const text = [
    notification.aps,
    title,
    `${m.history_table_head_device({}, options)}: ${device.name} (${device.id})`,
    `${m.history_table_head_alarm({}, options)}: ${description}`,
    `${m.history_table_head_date({}, options)} (UTC): ${timestamp}`,
  ].join("\n")

  return {
    to: recipient.email,
    subject: `[${notification.aps}] ${title} - ${device.name}`,
    text,
    html: `<div lang="${locale}">${escapeHtml(text).replaceAll("\n", "<br>")}</div>`,
  }
}

/**
 * Framework-independent handler, ready to wrap in a future route action.
 * No route, environment variables, transport or database are configured here.
 * eventId is correlation metadata, NOT persistent duplicate protection.
 * Partial failures include recipient indexes: do not retry accepted recipients.
 * The existing email.server.ts helper swallows errors and cannot satisfy the
 * sendEmail contract until its error handling is adapted.
 */
export function createNotificationsHandler({
  authenticate,
  sendEmail,
}: NotificationDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "POST" } }
      )
    }

    try {
      const identity = await authenticate(request)
      if (!identity) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (
        request.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .toLowerCase() !== "application/json"
      ) {
        return Response.json({ error: "Expected JSON" }, { status: 415 })
      }

      let notification: AlarmNotification
      try {
        notification = parseAlarmNotification(await request.json())
      } catch {
        return Response.json(
          { error: "Invalid notification payload" },
          { status: 400 }
        )
      }
      if (notification.aps !== identity.aps) {
        return Response.json(
          { error: "Installation not authorized" },
          { status: 403 }
        )
      }
      if (notification.alarmLog.operation.id !== 1) {
        return Response.json({
          eventId: notification.eventId,
          status: "ignored",
        })
      }

      // Render every message before sending; each email has one recipient.
      const emails = notification.recipients.map((recipient) =>
        composeNotificationEmail(notification, recipient)
      )
      const accepted: number[] = []
      const failed: number[] = []
      for (const [index, email] of emails.entries()) {
        try {
          await sendEmail(email)
          accepted.push(index)
        } catch {
          failed.push(index)
        }
      }
      return Response.json(
        { eventId: notification.eventId, accepted, failed },
        { status: failed.length > 0 ? 502 : 200 }
      )
    } catch {
      return Response.json(
        { error: "Notification processing failed" },
        { status: 500 }
      )
    }
  }
}
