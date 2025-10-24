import React, { useState } from "react";
import { data, Link, Outlet, redirect } from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import { AppSidebar } from "~/components/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AlarmInfo } from "~/components/alarm-info";
import { CommInfo } from "~/components/comm-info";
import { LocaleToggle } from "~/components/locale-toggle";
import { OccupancyInfo } from "~/components/parking-info";
import { ModeToggle } from "~/components/mode-toggle";
import { getSession } from "~/lib/session.server";
import { useInfo } from "~/lib/ws";
import { getLocale } from "~/middleware/i18next";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  let locale = getLocale(context);
  // let aps = params.aps;
  const { aps, session, user } = await getSession(request);
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup");
  }
  if (!session.twoFactorVerified) {
    return redirect("/2fa/authentication");
  }
  console.log("From aps layout:\n", aps, session, user);

  // need to get from collection aps form apsId to display aps name, etc...
  // if (aps !== session.apsId) {
  //   return redirect("/login"); // redirect or set error
  // }
  // check user roles
  // ....
  return { aps: aps.ns, locale };
}

export default function ApsLayout({ loaderData }: Route.ComponentProps) {
  const [locale, setLocale] = useState(loaderData?.locale);
  useChangeLanguage(locale);
  // ws
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${loaderData?.aps}/info`;
  const { comm, diag, map } = useInfo(url);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="grow-1">
            <span className="capitalize hidden sm:inline">
              {"loaderData?.aps?.ns"}
            </span>
          </div>
          <div className="flex gap-3">
            <AlarmInfo active={diag || 0} />
            <CommInfo status={comm} />
            <OccupancyInfo occupancy={map} />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
          </div>
          <LocaleToggle locale={locale} setLocale={(lang) => setLocale(lang)} />
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
