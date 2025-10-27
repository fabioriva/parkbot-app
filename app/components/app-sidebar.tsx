import * as React from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";

export function AppSidebar({
  aps,
  roles,
}: React.ComponentProps<typeof Sidebar>) {
  // console.log(aps, roles);
  const location = useLocation();
  const { t } = useTranslation();
  const data = {
    navMain: [
      {
        title: t("aps.sidebar.title"),
        url: "#",
        items: [
          {
            title: t("aps.sidebar.menu.dashboard"),
            url: `/aps/${aps.ns}/dashboard`,
          },
          {
            title: t("aps.sidebar.menu.overview"),
            url: `/aps/${aps.ns}/devices`,
          },
        ],
      },
    ],
  };
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-12 items-center justify-center rounded-lg mr-1">
                  <img src="/bot.svg" alt="Parkbot" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Parkbot App</span>
                  <span className="text-xs">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={item.url === location.pathname}
                        >
                          <a
                            href={item.url}
                            className={
                              !roles.some(
                                (role) => role === item.url.split("/").pop()
                              ) && "pointer-events-none"
                            }
                          >
                            {item.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
