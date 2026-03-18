import * as React from "react";
import { useTranslation } from "react-i18next";
import { Outlet, redirect, useLocation } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AlarmInfo } from "~/components/alarm-info";
import { CommInfo } from "~/components/comm-info";
import { LocaleToggle } from "~/components/locale-toggle";
import { ParkInfo } from "~/components/park-info";
import { ModeToggle } from "~/components/mode-toggle";
import { auth } from "~/lib/auth.server";
import { getCookie } from "~/lib/cookie.server";
import { useInfo } from "~/hooks/use-ws";

export async function loader({ params, request }: Route.LoaderArgs) {
  const data = await auth.api.getSession({
    headers: await request.headers,
  });
  if (!data) {
    return redirect("/");
  }
  if (!data.user.twoFactorEnabled) {
    return redirect("/2fa-setup");
  }
  if (data.user.aps !== params.aps) {
    return redirect("/not-found");
  }
  // TODO check roles
  const sidebarState = getCookie(request, "sidebar_state");
  return {
    sidebarState,
    user: data.user,
    aps: data.aps,
  };
}

export default function ApsLayout({
  loaderData: { aps, user, sidebarState },
}: Route.ComponentProps) {
  const {
    info: { comm, diag, map },
  } = useInfo(`${import.meta.env.VITE_WEBSOCK_URL}/${user.aps}/infos`);
  const location = useLocation();
  const { t } = useTranslation();
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
        <AppSidebar pathname={location.pathname} user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="grow-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={`/aps/${user.aps}/dashboard`}>
                      {aps.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">
                      {t(`sidebar.menu.${location.pathname.split("/").pop()}`)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex gap-3">
              {!comm ? (
                <React.Fragment>
                  <Badge variant="destructive">Data not available!</Badge>
                  <CommInfo status={comm} />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <AlarmInfo active={diag || 0} />
                  <CommInfo status={comm} />
                  <ParkInfo occupancy={map} />
                </React.Fragment>
              )}
              <Separator
                orientation="vertical"
                className="data-[orientation=vertical]:h-4"
              />
            </div>
            <LocaleToggle />
            <ModeToggle />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Outlet context={user} />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster
        toastOptions={{
          classNames: {
            description: "!text-muted-foreground !dark:text-muted",
          },
        }}
      />
    </TooltipProvider>
  );
}
