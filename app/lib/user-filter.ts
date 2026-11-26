export const ALL_USER_ROLES = "__all_roles__"

export type UserStatusFilter = "all" | "yes" | "no"

interface UserFilters {
  search?: string
  role?: string
  emailVerified?: UserStatusFilter
  twoFactor?: UserStatusFilter
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

const matchesStatus = (value: boolean, filter: UserStatusFilter) =>
  filter === "all" || value === (filter === "yes")

export function filterUsers<
  T extends {
    name: string
    email: string
    role: string
    emailVerified: boolean
    twoFactorEnabled?: boolean
  },
>(
  users: readonly T[],
  {
    search = "",
    role = ALL_USER_ROLES,
    emailVerified = "all",
    twoFactor = "all",
  }: UserFilters = {}
): T[] {
  const query = normalize(search.trim())
  return users.filter(
    (user) =>
      (role === ALL_USER_ROLES || user.role === role) &&
      matchesStatus(user.emailVerified, emailVerified) &&
      matchesStatus(user.twoFactorEnabled ?? false, twoFactor) &&
      (!query ||
        normalize(user.name).includes(query) ||
        normalize(user.email).includes(query))
  )
}
