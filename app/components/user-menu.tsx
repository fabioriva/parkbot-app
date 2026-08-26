import {
  ChevronsUpDown,
  SquareParking,
  Key,
  LogOut,
  ScanFace,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react"
import { buttonVariants } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { UserAvatar } from "~/components/user-avatar"
import { m } from "@paraglide/messages.js"

export function UserMenu({
  user,
}: {
  user: {
    email: string
    image: string
    name: string
  }
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar user={user} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{m.sidebar_user_admin()}</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={user.role !== "admin"}
                render={<a href={`/aps/${user.aps}/admin/aps`} />}
              >
                <SquareParking />
                Aps
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role !== "admin"}
                render={<a href={`/aps/${user.aps}/admin/subscription`} />}
              >
                <UserCog />
                {m.sidebar_user_subscriptions()}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role !== "admin"}
                render={<a href={`/aps/${user.aps}/admin/user`} />}
              >
                <Users />
                {m.sidebar_user_users()}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{m.sidebar_user_settings()}</DropdownMenuLabel>
              <DropdownMenuItem
                render={<a href={`/aps/${user.aps}/user/password`} />}
              >
                <Key />
                {m.sidebar_user_password()}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<a href={`/aps/${user.aps}/user/2fa`} />}
              >
                <ScanFace />
                {m.sidebar_user_twoFactor()}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<a href="/signout" />}
              variant="destructive"
            >
              <LogOut />
              {m.signout()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
