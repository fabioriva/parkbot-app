export default async function fetcher(...args) {
  try {
    const res = await fetch(...args);
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      throw new Error(res.statusText);
    }
  } catch (error) {
    return false
  }
}
