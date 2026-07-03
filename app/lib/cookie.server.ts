export function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)]) || [],
  );
  return cookies[name] || null;
}

export function getCookies(request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)]) || [],
  );
  return cookies;
}

export function getToken(request) {
  const raw =
    getCookie(request, "__Secure-parkbot.session_token") ??
    getCookie(request, "parkbot.session_token"); // fallback for localhost
  const token = raw?.split(".")[0] ?? null;
  return token;
}
