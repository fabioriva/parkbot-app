import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "react-router";

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__parkbot-theme",
      // domain: 'remix.run',
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secrets: ["s3cr3t"],
      // secure: true,
    },
  }),
);
