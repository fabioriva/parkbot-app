import React, { useState } from "react";
import { Link, Outlet } from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import { AppSidebar } from "~/components/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { LocaleToggle } from "~/components/locale-toggle";
import { ModeToggle } from "~/components/mode-toggle";
import { getLocale } from "~/middleware/i18next";

export async function loader({ context }: Route.LoaderArgs) {
  let locale = getLocale(context);
  return { locale };
}

export default function ApsLayout({ loaderData }: Route.ComponentProps) {
  const [locale, setLocale] = useState(loaderData?.locale);
  useChangeLanguage(locale);

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
          <div className="grow-1" />
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
