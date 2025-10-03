// import { redirect } from "react-router";

export default async function fetcher(...args) {
  try {
    const res = await fetch(...args);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    throw new Error(res.statusText);
  } catch (error) {
    // throw redirect("/"); // redirect to fetch error page
    return false;
  }
}
