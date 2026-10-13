export const permissions = {
  admin: [
    "read",
    "technical.read",
    "entry",
    "exit",
    "rollback",
    "queue.delete",
    "pp",
    "map.edit",
    "pin.edit",
    "notifications",
    "clock.set",
    "admin",
  ],
  service: [
    "read",
    "technical.read",
    "entry",
    "exit",
    "rollback",
    "queue.delete",
    "pp",
    "map.edit",
    "pin.edit",
    "notifications",
    "clock.set",
  ],
  valet: ["read", "exit", "rollback", "queue.delete"],
} as const

export type Role = keyof typeof permissions
export type Permission = (typeof permissions)[Role][number]

export function isRole(role: unknown): role is Role {
  return typeof role === "string" && Object.hasOwn(permissions, role)
}

export function can(role: unknown, permission: Permission): boolean {
  return (
    isRole(role) &&
    (permissions[role] as readonly string[]).includes(permission)
  )
}
