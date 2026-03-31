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
import { roles } from "~/lib/roles";

interface SidebarProps {
  aps: Aps;
  user: User;
  // Sidebar: React.ComponentProps<typeof Sidebar>
}
export function AppSidebar({ pathname, user }: SidebarProps) {
  const { t } = useTranslation();
  const navMain = {
    title: t("sidebar.title"),
    items: [
      {
        pathname: `/aps/${user.aps}/dashboard`,
        title: t("sidebar.menu.dashboard"),
      },
      {
        pathname: `/aps/${user.aps}/devices`,
        title: t("sidebar.menu.devices"),
      },
      {
        pathname: `/aps/${user.aps}/history`,
        title: t("sidebar.menu.history"),
      },
      {
        pathname: `/aps/${user.aps}/map`,
        title: t("sidebar.menu.map"),
      },
      {
        pathname: `/aps/${user.aps}/nodes`,
        title: t("sidebar.menu.nodes"),
      },
      {
        pathname: `/aps/${user.aps}/operations`,
        title: t("sidebar.menu.operations"),
      },
      {
        pathname: `/aps/${user.aps}/racks`,
        title: t("sidebar.menu.racks"),
      },
      {
        pathname: `/aps/${user.aps}/tags`,
        title: t("sidebar.menu.tags"),
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
                  <span className="font-bold">
                    {import.meta.env.VITE_APP_NAME}
                  </span>
                  <span className="text-xs">
                    v{import.meta.env.VITE_APP_VERSION}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{navMain.title}</SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {navMain.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.pathname === pathname}
                >
                  <a
                    href={item.pathname}
                    className={
                      !roles[user.role]?.some(
                        (role) => role === item.pathname.split("/").pop(),
                      )
                        ? "pointer-events-none opacity-50 !text-current"
                        : undefined
                    }
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
