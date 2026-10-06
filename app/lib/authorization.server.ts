import { data, redirect } from "react-router"
import { auth } from "./auth.server"

export async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    throw redirect("/signin")
  }
  if (session.user.role !== "admin") {
    throw data("Forbidden", { status: 403 })
  }
}
