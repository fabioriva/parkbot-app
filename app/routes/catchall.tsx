import { data } from "react-router";

export async function loader() {
  // throw new Response("Page not found", { status: 404 });
  throw data("Not Found", { status: 404 });
}

export default function Component() {
  return <></>;
}
