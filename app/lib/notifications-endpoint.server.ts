import { timingSafeEqual } from "node:crypto"
import { MailService } from "@sendgrid/mail"
import { createNotificationsHandler } from "./notifications.server"

const mailer = new MailService()
mailer.setTimeout(10_000)

async function authenticate(request: Request) {
  const token = /^Bearer ([^\s]+)$/i.exec(
    request.headers.get("authorization") ?? ""
  )?.[1]
  if (!token) return null

  // JSON map: { "daman": "a-dedicated-secret-for-this-installation" }.
  const configured: unknown = JSON.parse(
    process.env.NOTIFICATIONS_API_TOKENS ?? "null"
  )
  if (
    !configured ||
    typeof configured !== "object" ||
    Array.isArray(configured)
  ) {
    throw new Error("NOTIFICATIONS_API_TOKENS must map installations to tokens")
  }
  const entries = Object.entries(configured)
  if (
    entries.length === 0 ||
    entries.some(
      ([aps, secret]) =>
        !aps.trim() ||
        typeof secret !== "string" ||
        !secret ||
        /\s/.test(secret)
    ) ||
    new Set(entries.map(([, secret]) => secret)).size !== entries.length
  ) {
    throw new Error("Each installation must have a distinct nonempty token")
  }

  const supplied = Buffer.from(token)
  for (const [aps, secret] of entries) {
    const expected = Buffer.from(secret as string)
    if (
      supplied.length === expected.length &&
      timingSafeEqual(supplied, expected)
    ) {
      return { aps }
    }
  }
  return null
}

export const handleNotificationRequest = createNotificationsHandler({
  authenticate,
  async sendEmail(email) {
    const apiKey = process.env.SENDGRID_API_KEY
    const from = process.env.SENDGRID_SENDER
    if (!apiKey || !from) {
      throw new Error("SENDGRID_API_KEY and SENDGRID_SENDER are required")
    }
    mailer.setApiKey(apiKey)
    return mailer.send({ ...email, from })
  },
})
