import { Link } from "react-router"
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
  useSidebar,
} from "~/components/ui/sidebar"
import { UserAvatar } from "~/components/user-avatar"
import { UserMenu } from "~/components/user-menu"
import { roles } from "~/lib/roles"
import { safeMessageT } from "~/lib/trans"

import type { Aps } from "~/lib/aps.server"
import type { User } from "~/lib/user.server"

interface SidebarProps {
  aps: Aps
  user: User
  // Sidebar: React.ComponentProps<typeof Sidebar>
}
export function AppSidebar({ aps, pathname, user }: SidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const navMain = {
    items: [
      {
        pathname: `/aps/${user.aps}/dashboard`,
        title: safeMessageT("sidebar_main", "dashboard"),
      },
      {
        pathname: `/aps/${user.aps}/devices`,
        title: safeMessageT("sidebar_main", "devices"),
      },
      {
        pathname: `/aps/${user.aps}/history`,
        title: safeMessageT("sidebar_main", "history"),
      },
      {
        pathname: `/aps/${user.aps}/map`,
        title: safeMessageT("sidebar_main", "map"),
      },
      {
        pathname: `/aps/${user.aps}/nodes`,
        title: safeMessageT("sidebar_main", "nodes"),
      },
      {
        pathname: `/aps/${user.aps}/operations`,
        title: safeMessageT("sidebar_main", "operations"),
      },
      {
        pathname: `/aps/${user.aps}/racks`,
        title: safeMessageT("sidebar_main", "racks"),
      },
      {
        pathname: `/aps/${user.aps}/tags`,
        title: safeMessageT("sidebar_main", "tags"),
      },
    ],
  }
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => isMobile && setOpenMobile(false)}
              render={<Link to={`/aps/${user.aps}/dashboard`} />}
            >
              <UserAvatar user={user} />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold">
                  {import.meta.env.VITE_APP_NAME}
                </span>
                <span className="text-xs">
                  v{import.meta.env.VITE_APP_VERSION}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel render={<Link to="/aps-select" />}>
            {aps}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {navMain.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={item.pathname === pathname}
                  onClick={() => isMobile && setOpenMobile(false)}
                  render={
                    <Link
                      to={item.pathname}
                      className={
                        !roles[user.role]?.some(
                          (role) => role === item.pathname.split("/").pop()
                        )
                          ? "pointer-events-none text-current! opacity-50"
                          : undefined
                      }
                    />
                  }
                >
                  {item.title}
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
  )
}
