import React, { useState } from "react";
import { data, Link, Outlet, redirect } from "react-router";
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
import { getSession, getSessionCookie } from "~/lib/session.server";
import { getUserRoles } from "~/lib/user.server";
import { useInfo } from "~/lib/ws";

export async function loader({ params, request }: Route.LoaderArgs) {
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
  // check aps dynamic segment
  if (aps.ns !== params.aps) {
    return redirect("/not-found");
  }
  // check user roles
  const url = new URL(request.url);
  const roles = await getUserRoles(user.id);
  if (!roles.some((role) => role === url.pathname.split("/")[3])) {
    // .pop())) {
    return redirect("/not-found");
  }
  // get sidebar_state cookie
  const cookieHeader = request.headers.get("Cookie");
  const cookies = Object.fromEntries(
    cookieHeader
      ?.split("; ")
      .map((cookie) => cookie.split("="))
      .map(([key, value]) => [key, decodeURIComponent(value)]) || []
  );
  const sidebarState = cookies["sidebar_state"];

  // test
  const sessionCookie = await getSessionCookie(request);
  const res = await fetch("http://localhost:5173/action/get-session", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionCookie.token,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log(res);
  console.log(data);
  // end test
  return { aps, roles, sidebarState, user };
}

export default function ApsLayout({ loaderData }: Route.ComponentProps) {
  // console.log(loaderData);
  const { aps, roles, sidebarState, user } = loaderData;
  const url = `${import.meta.env.VITE_WEBSOCK_URL}/${aps.ns}/info`;
  const { comm, diag, map } = useInfo(url);

  return (
    <SidebarProvider
      defaultOpen={sidebarState === "true"}
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar aps={aps} roles={roles} user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="grow-1">
            <span className="capitalize hidden sm:inline">APS {aps.name}</span>
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
          <LocaleToggle />
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
