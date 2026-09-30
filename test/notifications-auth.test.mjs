import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { authenticateNotificationRequest } from "../app/lib/notifications-auth.server.ts"

const request = (token) =>
  new Request("http://localhost/api/notifications", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

test("notification credentials support files and inline configuration safely", async (t) => {
  const originalFile = process.env.NOTIFICATIONS_API_TOKENS_FILE
  const originalInline = process.env.NOTIFICATIONS_API_TOKENS
  const directory = await mkdtemp(join(tmpdir(), "parkbot-auth-"))
  const file = join(directory, "tokens.json")
  try {
    await t.test(
      "inline tokens identify only their associated installation",
      async () => {
        delete process.env.NOTIFICATIONS_API_TOKENS_FILE
        process.env.NOTIFICATIONS_API_TOKENS = JSON.stringify({
          alpha: "alpha-secret",
          beta: "beta-secret",
        })
        assert.deepEqual(
          await authenticateNotificationRequest(request("alpha-secret")),
          { aps: "alpha" }
        )
        assert.deepEqual(
          await authenticateNotificationRequest(request("beta-secret")),
          { aps: "beta" }
        )
        assert.equal(
          await authenticateNotificationRequest(request("wrong-secret")),
          null
        )
        assert.equal(await authenticateNotificationRequest(request()), null)
      }
    )
    await t.test(
      "file takes precedence and rotation invalidates the old token",
      async () => {
        process.env.NOTIFICATIONS_API_TOKENS_FILE = file
        await writeFile(file, JSON.stringify({ alpha: "file-secret" }))
        assert.deepEqual(
          await authenticateNotificationRequest(request("file-secret")),
          { aps: "alpha" }
        )
        assert.equal(
          await authenticateNotificationRequest(request("alpha-secret")),
          null
        )
        await writeFile(file, JSON.stringify({ alpha: "rotated-secret" }))
        assert.equal(
          await authenticateNotificationRequest(request("file-secret")),
          null
        )
        assert.deepEqual(
          await authenticateNotificationRequest(request("rotated-secret")),
          { aps: "alpha" }
        )
      }
    )
    await t.test(
      "missing or malformed files never fall back to inline tokens",
      async () => {
        process.env.NOTIFICATIONS_API_TOKENS_FILE = join(
          directory,
          "missing.json"
        )
        await assert.rejects(() =>
          authenticateNotificationRequest(request("alpha-secret"))
        )
        process.env.NOTIFICATIONS_API_TOKENS_FILE = file
        await writeFile(file, "invalid json")
        await assert.rejects(() =>
          authenticateNotificationRequest(request("alpha-secret"))
        )
      }
    )
    await t.test(
      "invalid maps and shared credentials are rejected",
      async () => {
        for (const value of [
          null,
          [],
          {},
          { alpha: "" },
          { alpha: "has spaces" },
          { " ": "secret" },
          { alpha: 123 },
          { alpha: "shared", beta: "shared" },
        ]) {
          await writeFile(file, JSON.stringify(value))
          await assert.rejects(() =>
            authenticateNotificationRequest(request("shared"))
          )
        }
      }
    )
  } finally {
    if (originalFile === undefined)
      delete process.env.NOTIFICATIONS_API_TOKENS_FILE
    else process.env.NOTIFICATIONS_API_TOKENS_FILE = originalFile
    if (originalInline === undefined)
      delete process.env.NOTIFICATIONS_API_TOKENS
    else process.env.NOTIFICATIONS_API_TOKENS = originalInline
    await rm(directory, { recursive: true, force: true })
  }
})
