export default async function fetcher(...args) {
  try {
    const res = await fetch(...args);
    if (res.ok) {
      return await res.json();
    }
    throw new Error(res);
  } catch (error) {
    return null;
  }
}
