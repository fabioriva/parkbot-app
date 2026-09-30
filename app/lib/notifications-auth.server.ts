import { timingSafeEqual } from "node:crypto"
import { readFile } from "node:fs/promises"

/** File paths are resolved from the server working directory. */
export async function authenticateNotificationRequest(request: Request) {
  const token = /^Bearer ([^\s]+)$/i.exec(
    request.headers.get("authorization") ?? ""
  )?.[1]
  if (!token) return null

  // Read on each request so file updates take effect without restarting.
  // A configured file takes precedence; read/parse errors must not fall back.
  const file = process.env.NOTIFICATIONS_API_TOKENS_FILE?.trim()
  const configured: unknown = JSON.parse(
    file
      ? await readFile(file, "utf8")
      : (process.env.NOTIFICATIONS_API_TOKENS ?? "null")
  )
  if (
    !configured ||
    typeof configured !== "object" ||
    Array.isArray(configured)
  ) {
    throw new Error("Notification tokens must map installations to tokens")
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
