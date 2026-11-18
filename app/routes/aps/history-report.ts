import type { LoaderFunctionArgs } from "react-router"
import { requireAps } from "~/lib/authorization.server"
import { getToken } from "~/lib/cookie.server"
import { isValidTimeZone } from "~/lib/date-time"
import { reportParameters } from "~/lib/history-query"
import { createHistoryReport } from "~/lib/history-report.server"

let activeReports = 0

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await requireAps(request, params.aps!, "read")
  const timeZone = session.aps?.timeZone
  const headers = { "Cache-Control": "private, no-store" }
  if (!isValidTimeZone(timeZone))
    return new Response("Missing plant time zone", { status: 400, headers })
  const search = new URL(request.url).searchParams
  let parsed: ReturnType<typeof reportParameters>
  try {
    parsed = reportParameters(search, timeZone)
  } catch {
    return new Response("Invalid report filters", { status: 400, headers })
  }
  const locale = search.get("locale") === "it" ? "it" : "en"
  const query = new URLSearchParams(
    Object.entries(parsed.parameters).map(([key, value]) => [
      key,
      String(value),
    ])
  )
  if (activeReports >= 2)
    return new Response("Report generation busy", {
      status: 429,
      headers: { ...headers, "Retry-After": "10" },
    })
  activeReports++
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/${encodeURIComponent(params.aps!)}/history/export?${query}`,
      {
        headers: { Authorization: `Bearer ${getToken(request)}` },
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(35_000)]),
      }
    )
    if (!response.ok)
      return new Response("History export failed", {
        status: response.status,
        headers,
      })
    const payload = await response.json()
    if (!Array.isArray(payload.query) || payload.query.length > 5000)
      throw new Error("Invalid history export response")
    const pdf = await createHistoryReport({
      records: payload.query,
      plant: session.aps?.name || params.aps!,
      timeZone,
      range: parsed.range,
      filters: parsed.parameters,
      locale,
    })
    return new Response(new Uint8Array(pdf), {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="parkbot-history-${parsed.range.from}-${parsed.range.to}.pdf"`,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    if (!request.signal.aborted)
      console.error("History PDF generation failed", error)
    return new Response("Unable to generate history report", {
      status: 502,
      headers,
    })
  } finally {
    activeReports--
  }
}
