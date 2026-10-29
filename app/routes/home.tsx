import { Welcome } from "../welcome/welcome"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Parkbot · Sotefin" },
    { name: "description", content: m.welcome_text() },
  ]
}

export default function Home({}: Route.ComponentProps) {
  return <Welcome />
}
