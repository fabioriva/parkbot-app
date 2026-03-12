import * as React from "react";
import { Outlet, redirect } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
// import { Toaster } from "~/components/ui/sonner";
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
  try {
    const data = await auth.api.getSession({
      headers: await request.headers,
    });
    if (!data) {
      return redirect("/");
    }
    const { session, user, aps } = data;
    if (!user.twoFactorEnabled) {
      return redirect("/2fa-setup");
    }
    if (user.aps !== params.aps) {
      return redirect("/not-found");
    }
    // TODO check roles
    const sidebarState = getCookie(request, "sidebar_state");
    return {
      sidebarState,
      user,
      aps,
    };
  } catch (error) {
    console.log("getSession error:", error);
  }
}

export default function ApsLayout({
  loaderData: { aps, user, sidebarState },
}: Route.ComponentProps) {
  const {
    info: { comm, diag, map },
  } = useInfo(`${import.meta.env.VITE_WEBSOCK_URL}/${user.aps}/info`);
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
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="grow-1">
              <span className="capitalize hidden sm:inline">
                APS {aps.name}
              </span>
            </div>
            <div className="flex gap-3">
              <AlarmInfo active={diag || 1} />
              <CommInfo status={comm} />
              <ParkInfo occupancy={map} />
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
        {/* <Toaster
        toastOptions={{
          classNames: {
            description: "!text-muted-foreground !dark:text-muted",
          },
        }}
      /> */}
      </SidebarProvider>
    </TooltipProvider>
  );
}
