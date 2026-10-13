export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export default async function fetcher(...args: Parameters<typeof fetch>) {
  const res = await fetch(...args)
  if (!res.ok) {
    const message = `${res.status} ${res.statusText}`
    if (typeof window === "undefined")
      throw new Response(message, { status: res.status })
    throw new HttpError(res.status, message)
  }
  return await res.json()
}
