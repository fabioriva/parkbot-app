import { ArrowRight } from "lucide-react"
import { m } from "@paraglide/messages.js"
import "./parkbot-footer.css"

export function ParkbotFooter() {
  return (
    <footer className="parkbot-footer">
      <p>
        Parkbot © {new Date().getFullYear()}{" "}
        <a href="https://www.sotefin.com/">
          Sotefin SA <ArrowRight size={13} aria-hidden="true" />
        </a>
      </p>
      <span>{m.welcome_service()}</span>
    </footer>
  )
}
