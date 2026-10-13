import { data } from "react-router"
import { auth } from "./auth.server"
import { can, isRole, type Permission } from "./permissions"

export async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw data("Unauthorized", { status: 401 })
  if (
    !session.user.emailVerified ||
    (process.env.TWO_FACTOR === "enabled" && !session.user.twoFactorEnabled)
  )
    throw data("Forbidden", { status: 403 })
  return session
}

export async function requireAps(
  request: Request,
  aps: string,
  permission: Permission = "read"
) {
  const session = await requireSession(request)
  const role = session.user.role
  if (
    !isRole(role) ||
    !session.assignedAps.includes(aps) ||
    session.user.aps !== aps ||
    !can(role, permission)
  )
    throw data("Forbidden", { status: 403 })
  return { ...session, user: { ...session.user, role } }
}

export async function requireAdmin(request: Request, aps: string) {
  return requireAps(request, aps, "admin")
}
