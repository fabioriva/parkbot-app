import type { Aps } from "./aps.server"

export const ALL_COMPANIES = "__all_companies__"

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

export function filterAps<
  T extends Pick<Aps, "name" | "ns" | "city" | "company">,
>(aps: readonly T[], company: string, search: string): T[] {
  const query = normalize(search.trim())
  return aps.filter(
    (item) =>
      (company === ALL_COMPANIES || item.company === company) &&
      (!query ||
        [item.name, item.ns, item.city].some((value) =>
          normalize(value).includes(query)
        ))
  )
}
