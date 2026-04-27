import * as React from "react";
import { useTranslation } from "react-i18next";
import { data, Outlet, redirect, useLocation } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
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
import { ConfirmDialogProvider } from "~/components/confirm-dialog";
import { LocaleToggle } from "~/components/locale-toggle";
import { ParkInfo } from "~/components/park-info";
import { ModeToggle } from "~/components/mode-toggle";
import { auth } from "~/lib/auth.server";
import { getCookie } from "~/lib/cookie.server";
import { roles } from "~/lib/roles";
import { useInfo } from "~/hooks/use-ws";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: await request.headers,
  });
  if (!session) {
    // throw data("Unauthorized", { status: 401 });
    return redirect("/signin");
  }
  if (session.user.aps !== params.aps) {
    throw data("Forbidden", { status: 403 });
  }
  const path = new URL(request.url).pathname.split("/")[3] || "";
  if (
    path !== "user" &&
    !roles[session.user.role]?.some((role) => role === path)
  ) {
    throw data("Forbidden", { status: 403 });
  }
  if (process.env.TWO_FACTOR === "enabled" && !session.user.twoFactorEnabled) {
    return redirect("/2fa-setup");
  }
  const sidebarState = getCookie(request, "sidebar_state");
  return {
    sidebarState,
    user: session.user,
    aps: session.aps,
  };
}

export default function ApsLayout({
  loaderData: { aps, user, sidebarState },
}: Route.ComponentProps) {
  const {
    info: { comm, diag, map },
  } = useInfo(`${import.meta.env.VITE_WEBSOCK_URL}/${user.aps}/info`);
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
        <AppSidebar aps={aps.name} pathname={location.pathname} user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="grow-1">
              <Breadcrumb className="hidden lg:block">
                <BreadcrumbList>
                  {/* breakpoint md:block */}
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/aps-select">Aps</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/aps/${user.aps}/dashboard`}>
                      {aps.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">
                      {t(`sidebar.menu.${location.pathname.split("/")[3]}`)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {!comm ? (
              <Badge variant="destructive">Data not available!</Badge>
            ) : (
              <React.Fragment>
                <AlarmInfo active={diag || 0} />
                <ParkInfo occupancy={map} user={user} />
                <CommInfo status={comm} />
              </React.Fragment>
            )}
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
            <LocaleToggle />
            <ModeToggle />
          </header>
          <div className="p-3">
            <ConfirmDialogProvider>
              <Outlet context={user} />
            </ConfirmDialogProvider>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            description: "!text-muted-foreground !dark:text-muted",
          },
        }}
      />
    </TooltipProvider>
  );
}
