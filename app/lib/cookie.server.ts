export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]): [string, string] => [key, decodeURIComponent(value)]) || []
  )
  return cookies[name] || null
}

export function getCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]): [string, string] => [key, decodeURIComponent(value)]) || []
  )
  return cookies
}

export function getToken(request: Request): string | null {
  const raw =
    getCookie(request, "__Secure-parkbot.session_token") ??
    getCookie(request, "parkbot.session_token") // fallback for localhost
  const token = raw?.split(".")[0] ?? null
  return token
}
