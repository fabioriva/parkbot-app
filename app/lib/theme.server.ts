import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

// const isProduction = import.meta.env.PROD;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "parkbot.theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.BETTER_AUTH_SECRET],
    // Set domain and secure only if in production
    // ...(isProduction ? { domain: "sotefinservice.com", secure: true } : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
