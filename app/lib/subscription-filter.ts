import type { Aps } from "./aps.server"
import type { Subscription } from "./subscription.server"
import { ALL_COMPANIES } from "./aps-filter"

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

export function subscriptionCompanies(
  subscriptions: readonly Pick<Subscription, "company">[],
  companies: readonly string[]
): string[] {
  return [
    ...new Set([...companies, ...subscriptions.map((item) => item.company)]),
  ]
    .filter((company) => company.trim().length > 0)
    .sort((a, b) => a.localeCompare(b))
}

export function filterSubscriptions<
  T extends Pick<Subscription, "email" | "company" | "aps">,
>(
  subscriptions: readonly T[],
  aps: readonly Pick<Aps, "ns" | "name">[],
  company: string,
  search: string
): T[] {
  const query = normalize(search.trim())
  const names = new Map(aps.map((item) => [item.ns, item.name]))
  return subscriptions.filter(
    (item) =>
      (company === ALL_COMPANIES || item.company === company) &&
      (!query ||
        normalize(item.email).includes(query) ||
        item.aps.some(
          (ns) =>
            normalize(ns).includes(query) ||
            normalize(names.get(ns) ?? "").includes(query)
        ))
  )
}
