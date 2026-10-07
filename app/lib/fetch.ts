export default async function fetcher(...args: Parameters<typeof fetch>) {
  try {
    const res = await fetch(...args)
    if (res.ok) {
      return await res.json()
    }
    return null
  } catch {
    return null
  }
}
