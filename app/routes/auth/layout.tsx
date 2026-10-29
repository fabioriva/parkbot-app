import { Bot } from "lucide-react"
import { Link, Outlet } from "react-router"
import { LocaleToggle } from "~/components/locale-toggle"
import { ModeToggle } from "~/components/mode-toggle"
import { m } from "@paraglide/messages.js"
import "./auth.css"

export default function Auth() {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-brand" aria-label="Parkbot auth service">
          <span className="auth-brand-icon">
            <Bot size={26} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span className="auth-brand-text">
            <span>
              parkbot<span className="auth-brand-dot">.</span>
            </span>
            <span className="auth-brand-service">auth service</span>
          </span>
        </Link>
        <div className="auth-controls">
          <LocaleToggle label={m.auth_language()} />
          <ModeToggle />
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-panel">
          <Outlet />
          <p className="py-3 text-center text-xs text-balance text-muted-foreground">
            By clicking submit, you agree to our terms of service
          </p>
        </div>
      </main>
      <footer className="auth-footer">
        <span>Parkbot © {new Date().getFullYear()}</span>
        <span aria-hidden="true">·</span>
        <a href="https://www.sotefin.com/">Sotefin SA</a>
      </footer>
    </div>
  )
}
