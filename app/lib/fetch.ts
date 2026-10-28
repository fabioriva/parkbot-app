export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "HttpError"
  }
}

function throwHttpError(status: number, message: string): never {
  if (typeof window === "undefined") throw new Response(message, { status })
  throw new HttpError(status, message)
}

async function fetchJson(...args: Parameters<typeof fetch>) {
  const res = await fetch(...args)
  if (!res.ok) {
    throwHttpError(res.status, `${res.status} ${res.statusText}`)
  }
  return await res.json()
}

export default async function fetcher(...args: Parameters<typeof fetch>) {
  const [input, options] = args
  const request = input instanceof Request ? input : undefined
  const method = options?.method ?? request?.method ?? "GET"

  // Writes keep their existing behavior and are never retried here.
  if (method.toUpperCase() !== "GET") return fetchJson(...args)

  const callerSignal =
    options?.signal === undefined ? request?.signal : options.signal
  const timeout = new AbortController()
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeout.signal])
    : timeout.signal
  const timer = setTimeout(() => timeout.abort(), 10_000)

  try {
    // The deadline includes reading the response body, not just its headers.
    return await fetchJson(input, { ...options, signal })
  } catch (error) {
    if (callerSignal?.aborted) throw error
    if (timeout.signal.aborted) {
      throwHttpError(504, "504 API request timed out")
    }
    if (error instanceof TypeError) {
      throwHttpError(503, "503 API connection unavailable")
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
