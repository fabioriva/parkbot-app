import * as React from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { NavUser } from "~/components/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { Aps } from "~/lib/aps.server";
import type { User } from "~/lib/user.server";

interface SidebarProps {
  aps: Aps;
  user: User;
  // Sidebar: React.ComponentProps<typeof Sidebar>
}

export function AppSidebar({ user }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const navMain = {
    title: t("sidebar.title"),
    items: [
      {
        title: t("sidebar.menu.dashboard"),
        url: `/aps/${user.aps}/dashboard`,
      },
      {
        title: t("sidebar.menu.devices"),
        url: `/aps/${user.aps}/devices`,
      },
      {
        title: t("sidebar.menu.history"),
        url: `/aps/${user.aps}/history`,
      },
      {
        title: t("sidebar.menu.map"),
        url: `/aps/${user.aps}/map`,
      },
      {
        title: t("sidebar.menu.racks"),
        url: `/aps/${user.aps}/racks`,
      },
      {
        title: t("sidebar.menu.statistics"),
        url: `/aps/${user.aps}/statistics`,
      },
      {
        title: t("sidebar.menu.tags"),
        url: `/aps/${user.aps}/tags`,
      },
    ],
  };
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={`/aps/${user.aps}/dashboard`}>
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg mr-1">
                  <img src="/bot.svg" alt="Parkbot" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">Parkbot App</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{navMain.title}</SidebarGroupLabel>
          <SidebarMenu className="gap-0">
            {navMain.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.url === location.pathname}
                >
                  <a
                    href={item.url}
                    className={
                      user.role !== "admin" &&
                      "pointer-events-none opacity-50 !text-current"
                    }
                    // className={
                    //   (!user.role.some(
                    //     (role) => role === item.url.split("/").pop(),
                    //   ) &&
                    //     "pointer-events-none opacity-50 !text-current") ||
                    //   undefined
                    // }
                  >
                    {item.title}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
//
