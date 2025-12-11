import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

// You can default to 'development' if process.env.NODE_ENV is not set
// const isProduction = process.env.NODE_ENV === "production";
const isProduction = import.meta.env.PROD;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__pb_themes",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [import.meta.env.VITE_COOKIE_SIGNATURE],
    // secure: true,
    // Set domain and secure only if in production
    ...(isProduction ? { domain: "sotefinservice.com", secure: true } : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
