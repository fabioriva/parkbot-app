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
import { UserMenu } from "~/components/user-menu";
import type { Aps } from "~/lib/aps.server";
import type { User } from "~/lib/user.server";
import { roles } from "~/lib/roles";
import { m } from "@paraglide/messages.js";

interface SidebarProps {
  aps: Aps;
  user: User;
  // Sidebar: React.ComponentProps<typeof Sidebar>
}
export function AppSidebar({ aps, pathname, user }: SidebarProps) {
  const navMain = {
    title: m.sidebar_main(),
    items: [
      {
        pathname: `/aps/${user.aps}/dashboard`,
        title: m["sidebar_main.dashboard"](),
      },
      {
        pathname: `/aps/${user.aps}/devices`,
        title: m["sidebar_main.devices"](),
      },
      {
        pathname: `/aps/${user.aps}/history`,
        title: m["sidebar_main.history"](),
      },
      {
        pathname: `/aps/${user.aps}/map`,
        title: m["sidebar_main.map"](),
      },
      {
        pathname: `/aps/${user.aps}/nodes`,
        title: m["sidebar_main.nodes"](),
      },
      {
        pathname: `/aps/${user.aps}/operations`,
        title: m["sidebar_main.operations"](),
      },
      {
        pathname: `/aps/${user.aps}/racks`,
        title: m["sidebar_main.racks"](),
      },
      {
        pathname: `/aps/${user.aps}/tags`,
        title: m["sidebar_main.tags"](),
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
                  <img
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user.aps}`} // src="/bot.svg"
                    alt="Parkbot"
                  />
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
          {/* <SidebarGroupLabel>{navMain.title}</SidebarGroupLabel> */}
          <SidebarGroupLabel>{aps}</SidebarGroupLabel>
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
                        ? "pointer-events-none opacity-50 text-current!"
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
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
//
