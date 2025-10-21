import { initReactI18next } from "react-i18next";
import { createCookie } from "react-router";
import { createI18nextMiddleware } from "remix-i18next/middleware";
import resources from "~/locales";
import "i18next";

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
});

export const [i18nextMiddleware, getLocale, getInstance] =
  createI18nextMiddleware({
    detection: {
      supportedLanguages: ["it", "en"], // supported languages, the fallback should be last
      fallbackLanguage: "en",
      cookie: localeCookie, // The cookie to store the user preference
    },
    i18next: { resources }, // App locales
    plugins: [initReactI18next],
  });

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: typeof resources.en; // Use `en` as source of truth for the types
  }
}
