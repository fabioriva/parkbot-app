import * as React from "react"
import { data, Outlet } from "react-router"
import { Badge } from "~/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { Toaster } from "~/components/ui/toast"
import { TooltipProvider } from "~/components/ui/tooltip"
import { AlarmInfo } from "~/components/alarm-info"
import { AppSidebar } from "~/components/app-sidebar"
import { CommInfo } from "~/components/comm-info"
import { ConfirmDialogProvider } from "~/components/confirm-dialog"
import { LocaleToggle } from "~/components/locale-toggle"
import { ParkInfo } from "~/components/park-info"
import { ModeToggle } from "~/components/mode-toggle"
import { requireAps } from "~/lib/authorization.server"
import { getCookie } from "~/lib/cookie.server"
import { roles } from "~/lib/roles"
import { useInfo, WebSocketAuthContext } from "~/hooks/use-ws"
import { safeMessageT } from "~/lib/trans"
import { isValidTimeZone } from "~/lib/date-time"
import { Error as ErrorAlert } from "~/components/error-alert"
import { m } from "@paraglide/messages.js"
import type { Route } from "./+types/layout"

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await requireAps(request, params.aps)
  const apsNs = params.aps
  const url = new URL(request.url)
  // Normalize RR8 data request path
  const pathname = url.pathname.replace(/\.data$/, "")
  const [, , route] = pathname.split("/").filter(Boolean)
  const allowedRoutes =
    Object.entries(roles).find(([role]) => role === session.user.role)?.[1] ??
    []
  if (
    route !== "admin" &&
    route !== "user" &&
    !allowedRoutes.some((role) => role === route)
  ) {
    throw data("Forbidden", { status: 403 })
  }
  if (!session.aps) {
    throw data("Aps not found", { status: 404 })
  }
  const sidebarState = getCookie(request, "sidebar_state")
  return data(
    {
      aps: session.aps,
      pathname,
      route,
      sidebarState,
      token: session.session.token,
      user: { ...session.user, aps: apsNs },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  )
}

export default function ApsLayout({ loaderData }: Route.ComponentProps) {
  return (
    <WebSocketAuthContext value={loaderData.token}>
      <ApsContent loaderData={loaderData} />
    </WebSocketAuthContext>
  )
}

function ApsContent({ loaderData }: Pick<Route.ComponentProps, "loaderData">) {
  const { aps, pathname, route, sidebarState, user } = loaderData
  const timeZone = isValidTimeZone(aps?.timeZone) ? aps.timeZone : null
  const {
    info: { comm, diag, map },
    loading,
    connectionState,
  } = useInfo(`${import.meta.env.VITE_WEBSOCK_URL}/${user.aps}/info`, timeZone)
  const connectionMessage =
    connectionState === "closed"
      ? m.plant_api_disconnected()
      : connectionState === "connecting" || loading
        ? m.plant_waiting_for_data()
        : !comm
          ? m.plant_plc_offline()
          : null
  const plantReady =
    connectionState === "closed"
      ? false
      : connectionState !== "open" || loading
        ? null
        : comm
  const outletContext = React.useMemo(
    () => ({ aps, user, plantReady }),
    [aps, user, plantReady]
  )

  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={sidebarState === "true"}
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar aps={aps.name} pathname={pathname} user={user} />
        <SidebarInset>
          <header className="flex h-16 items-center px-4">
            <div className="flex h-6 grow items-center gap-1.5">
              <SidebarTrigger className="-ml-1.5" />
              <Separator className="mr-2.5" orientation="vertical" />
              <Breadcrumb className="grow">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden lg:block">
                    <BreadcrumbLink href="/aps-select">
                      {aps.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden lg:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="w-16 truncate capitalize lg:w-full">
                      {safeMessageT("sidebar_main", route)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {connectionMessage ? (
                <Badge variant="destructive">{connectionMessage}</Badge>
              ) : (
                <React.Fragment>
                  <AlarmInfo active={diag || 0} />
                  <ParkInfo occupancy={map} user={user} />
                  <CommInfo status={comm} user={user} />
                </React.Fragment>
              )}
              <Separator orientation="vertical" />
              <LocaleToggle />
              <ModeToggle />
            </div>
          </header>
          <div className="p-3">
            {!timeZone && route !== "history" && (
              <ErrorAlert
                title={m.aps_field_time_zone()}
                description={m.aps_time_zone_missing()}
              />
            )}
            <ConfirmDialogProvider>
              <Outlet context={outletContext} />
            </ConfirmDialogProvider>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  )
}
