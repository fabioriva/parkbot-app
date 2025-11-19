// import { redirect } from "react-router";

export default async function fetcher(...args) {
  try {
    const res = await fetch(...args);
    // console.log(res, res.status);
    if (res.ok) {
      const data = await res.json();
      // return { data };
      return data;
    } else {
      console.log(await res.text());
      throw new Error(res.statusText);
    }
  } catch (error) {
    // throw redirect("/"); // redirect to fetch error page
    return false
    // console.error("Fetch error:", error.name, ",", error.message);
    return { error };
  }
}
