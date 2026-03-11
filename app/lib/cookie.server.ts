export function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)]) || [],
  );
  console.log(cookies);
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
  console.log(cookies);
  return cookies;  
}