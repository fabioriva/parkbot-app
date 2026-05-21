import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Parkbot App" },
    { name: "Parkbot", content: "Parkbot Web Service" },
  ];
}

export default function Home() {
  return <Welcome />;
}
