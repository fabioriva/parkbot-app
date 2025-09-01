import clsx from "clsx";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "~/theme.server";
import {
  getLocale,
  i18nextMiddleware,
  localeCookie,
} from "./middleware/i18next";

import type { Route } from "./+types/root";
import "./app.css";

export const unstable_middleware = [i18nextMiddleware];

export async function loader({ context, request }: Route.LoaderArgs) {
  const { getTheme } = await themeSessionResolver(request);
  let theme = getTheme();
  console.log("From root loader", theme);
  let locale = getLocale(context);
  return data(
    { theme },
    { locale },
    { headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
  );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// export function Layout({ children }: { children: React.ReactNode }) {
//   let { i18n } = useTranslation();

//   return (
//     <html lang={i18n.language} dir={i18n.dir(i18n.language)} className="dark">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <Meta />
//         <Links />
//       </head>
//       <body>
//         {children}
//         <ScrollRestoration />
//         <Scripts />
//       </body>
//     </html>
//   );
// }

// export default function App({ loaderData }: Route.ComponentProps) {
export function App({ loaderData }: Route.ComponentProps) {
  console.log("root loaderData", loaderData);
  const data = useLoaderData();
  console.log("root useLoaderData", data);
  const [theme] = useTheme();
  let { i18n } = useTranslation();

  // useChangeLanguage(loaderData.locale);
  useChangeLanguage(data.locale);
  // return <Outlet />;
  return (
    <html
      lang={i18n.language}
      dir={i18n.dir(i18n.language)}
      className={clsx(theme)}
      data-theme={theme ?? ""}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders({ loaderData }: Route.ComponentProps) {
  console.log("root loaderData", loaderData);

  const data = useLoaderData();
  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange={true}
    >
      <App />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
