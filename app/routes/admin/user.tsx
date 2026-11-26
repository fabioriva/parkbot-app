import { AlertCircle, CheckCircle2, SearchIcon } from "lucide-react"
import { useId, useState } from "react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Spinner } from "~/components/ui/spinner"
import { UserDeleteDialog } from "~/components/user-delete-dialog"
import { UserTable } from "~/components/user-table"
import { requireAdmin } from "~/lib/authorization.server"
import {
  findUsers,
  deleteUserByEmail,
  type User as UserRecord,
} from "~/lib/user.server"
import {
  ALL_USER_ROLES,
  filterUsers,
  type UserStatusFilter,
} from "~/lib/user-filter"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"
import type { Route } from "./+types/user"

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request, params.aps)
  try {
    const formData = await request.formData()
    const action = formData.get("action")
    const email = formData.get("email")
    if (action === "delete") {
      if (typeof email !== "string" || !email.trim()) {
        throw new Error(m.users_action_error())
      }
      const result = await deleteUserByEmail(email)
      if (!result.acknowledged || result.deletedCount !== 1) {
        throw new Error(m.users_action_error())
      }
      return {
        action: m.users_action_delete(),
        success: m.users_action_delete_success(),
      }
    }
    throw new Error(m.users_action_error())
  } catch {
    return { error: m.users_action_error() }
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request, params.aps)
  const users = await findUsers()
  return { users }
}

function UserFilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select<T>
        items={options}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onChange(nextValue)
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function User({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const searchId = useId()
  const [search, setSearch] = useState("")
  const [role, setRole] = useState(ALL_USER_ROLES)
  const [emailVerified, setEmailVerified] = useState<UserStatusFilter>("all")
  const [twoFactor, setTwoFactor] = useState<UserStatusFilter>("all")
  const [selectedUser, setSelectedUser] = useState<Pick<
    UserRecord,
    "name" | "email"
  > | null>(null)
  const busy = fetcher.state !== "idle"
  const openDelete = (user: Pick<UserRecord, "name" | "email">) => {
    if (busy) return
    fetcher.reset()
    setSelectedUser(user)
  }
  const setDeleteOpen = (open: boolean) => {
    if (!open && !busy) setSelectedUser(null)
  }
  const filteredUsers = filterUsers(loaderData.users, {
    search,
    role,
    emailVerified,
    twoFactor,
  })
  const hasFilters =
    search.trim().length > 0 ||
    role !== ALL_USER_ROLES ||
    emailVerified !== "all" ||
    twoFactor !== "all"
  const roleOptions = [
    { value: ALL_USER_ROLES, label: m.users_filter_all_roles() },
    ...[
      ...new Set([
        ...loaderData.users.map((user) => user.role),
        ...(role === ALL_USER_ROLES ? [] : [role]),
      ]),
    ]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: value && value !== "—" ? value : m.users_role_missing(),
      })),
  ]
  const unverifiedCount = loaderData.users.filter(
    (user) => !user.emailVerified
  ).length
  const numberFormat = new Intl.NumberFormat(getLocale())

  return (
    <>
      <Item
        className="mb-3 flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        variant="outline"
      >
        <ItemContent className="min-w-0">
          <ItemTitle>{m.users_title()}</ItemTitle>
          <ItemDescription className="line-clamp-none text-xs tabular-nums">
            {m.users_description({
              count: numberFormat.format(loaderData.users.length),
              unverified: numberFormat.format(unverifiedCount),
            })}
          </ItemDescription>
          {hasFilters && (
            <p
              role="status"
              className="text-xs text-muted-foreground tabular-nums"
            >
              {m.users_results({
                count: numberFormat.format(filteredUsers.length),
                total: numberFormat.format(loaderData.users.length),
              })}
            </p>
          )}
        </ItemContent>
      </Item>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor={searchId} className="text-xs text-muted-foreground">
            {m.users_search_label()}
          </Label>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.users_search_placeholder()}
              className="pl-8"
            />
          </div>
        </div>
        <UserFilterSelect
          label={m.users_filter_role()}
          value={role}
          options={roleOptions}
          onChange={setRole}
        />
        <UserFilterSelect<UserStatusFilter>
          label={m.users_filter_email()}
          value={emailVerified}
          options={[
            { value: "all", label: m.users_filter_all_emails() },
            { value: "yes", label: m.users_filter_email_verified() },
            { value: "no", label: m.users_filter_email_pending() },
          ]}
          onChange={setEmailVerified}
        />
        <UserFilterSelect<UserStatusFilter>
          label={m.users_filter_two_factor()}
          value={twoFactor}
          options={[
            { value: "all", label: m.users_filter_all_two_factor() },
            { value: "yes", label: m.users_filter_two_factor_enabled() },
            { value: "no", label: m.users_filter_two_factor_disabled() },
          ]}
          onChange={setTwoFactor}
        />
      </div>
      {hasFilters && (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("")
              setRole(ALL_USER_ROLES)
              setEmailVerified("all")
              setTwoFactor("all")
            }}
          >
            {m.users_reset_filters()}
          </Button>
        </div>
      )}
      {busy && (
        <p
          role="status"
          className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Spinner aria-hidden="true" className="motion-reduce:animate-none" />
          {m.users_deleting()}
        </p>
      )}
      {!busy && !selectedUser && fetcher.data?.error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{m.users_error_title()}</AlertTitle>
          <AlertDescription>{fetcher.data.error}</AlertDescription>
        </Alert>
      )}
      {!busy && fetcher.data?.success && (
        <Alert
          role="status"
          className="mb-3 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>{fetcher.data.action}</AlertTitle>
          <AlertDescription className="text-inherit">
            {fetcher.data.success}
          </AlertDescription>
        </Alert>
      )}
      {filteredUsers.length ? (
        <UserTable busy={busy} onDelete={openDelete} users={filteredUsers} />
      ) : (
        <div role="status" className="rounded-xl border px-4 py-8 text-center">
          <p className="text-sm font-medium">
            {loaderData.users.length
              ? m.users_no_results()
              : m.users_empty_title()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {loaderData.users.length
              ? m.users_no_results_hint()
              : m.users_empty_description()}
          </p>
        </div>
      )}
      {selectedUser && (
        <UserDeleteDialog
          key={selectedUser.email}
          user={selectedUser}
          fetcher={fetcher}
          open
          setOpen={setDeleteOpen}
        />
      )}
    </>
  )
}
