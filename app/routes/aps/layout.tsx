import { data, Outlet, redirect, useLocation } from "react-router";
// import { AppSidebar } from "~/components/app-sidebar";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
// import { AlarmInfo } from "~/components/alarm-info";
// import { CommInfo } from "~/components/comm-info";
// import { ConfirmDialogProvider } from "~/components/confirm-dialog";
// import { LocaleToggle } from "~/components/locale-toggle";
// import { ParkInfo } from "~/components/park-info";
// import { ModeToggle } from "~/components/mode-toggle";
import { auth } from "~/lib/auth.server";
import { getCookie } from "~/lib/cookie.server";
import { roles } from "~/lib/roles";
import { useInfo } from "~/hooks/use-ws";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: await request.headers,
  });
  if (!session) {
    return redirect("/signin");
  }
  if (session.user.aps !== params.aps) {
    throw data("Forbidden", { status: 403 });
  }
  const path = new URL(request.url).pathname.split("/")[3] || "";
  if (
    path !== "user" &&
    !roles[session.user.role]?.some((role) => role === path)
  ) {
    throw data("Forbidden", { status: 403 });
  }
  if (process.env.TWO_FACTOR === "enabled" && !session.user.twoFactorEnabled) {
    return redirect("/2fa-setup");
  }
  const sidebarState = getCookie(request, "sidebar_state");
  return {
    sidebarState,
    user: session.user,
    aps: session.aps,
  };
}

export default function ApsLayout({ loaderData }: Route.ComponentProps) {
  const {
    info: { comm, diag, map },
  } = useInfo(
    `${import.meta.env.VITE_WEBSOCK_URL}/${loaderData?.user.aps}/info`,
  );
  const location = useLocation();
  return (
    <TooltipProvider>
      <Outlet context={loaderData?.user} />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            description: "!text-muted-foreground !dark:text-muted",
          },
        }}
      />
    </TooltipProvider>
  );
}
