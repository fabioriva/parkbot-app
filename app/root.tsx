import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  type MiddlewareFunction,
} from "react-router"
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes"
import { themeSessionResolver } from "~/lib/theme.server"
import { getLocale, getTextDirection } from "@paraglide/runtime.js"
import { paraglideMiddleware } from "@paraglide/server.js"

import type { Route } from "./+types/root"
import "./app.css"
import { clsx } from "cn";

export const loader: LoaderFunction = async ({ request }) => {
  const pathname = new URL(request.url).pathname
  const { getTheme } = await themeSessionResolver(request)
  return {
    pathname,
    theme: getTheme(),
  }
}

export const middleware: MiddlewareFunction[] = [
  (ctx, next) => paraglideMiddleware(ctx.request, () => next()),
]

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}

export function App() {
  const data = useLoaderData<typeof loader>()
  const pathname = data.pathname.replace(/\_.data$/, "")
  const [theme] = useTheme()
  return (
    <html
      lang={getLocale()}
      dir={getTextDirection()}
      className={clsx(theme)}
      // className={pathname === "/" ? "dark" : clsx(theme)}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google" content="notranslate" />
        <Meta />
        <Links />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined
  if (isRouteErrorResponse(error)) {
    message = error.status // === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.data || error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }
  return (
    <main
      style={{
        marginTop: "1rem auto",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
        color: "#1f2937",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "1rem",
        }}
      >
        {message}
      </h1>
      <p style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
      <footer
        style={{
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e7eb",
          // fontSize: "0.875rem",
          color: "#6b7280",
        }}
      >
        <strong>Parkbot Web Service</strong> at https://sotefinservice.com
      </footer>
    </main>
  )
}
