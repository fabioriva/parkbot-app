import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { LocaleToggle } from "~/components/locale-toggle"
import { ModeToggle } from "~/components/mode-toggle"
import { cn } from "~/lib/utils"
import { m } from "@paraglide/messages.js"
import { getLocale, setLocale } from "@paraglide/runtime.js"

export function Welcome({ seed }) {
  return (
    <div className="flex h-screen items-center justify-center px-3">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          <span>Parkbot</span>
          <span className="inline md:hidden"> App</span>
          <span className="hidden md:inline"> Web Service</span>
        </h1>
        <h2 className="text-xl md:text-4xl">{m.welcome_text()}</h2>
        <div className="m-3 h-64 w-64 rounded-lg">
          <img
            src={`https://api.dicebear.com/10.x/bottts/svg?seed=${seed}`}
            alt="Parkbot"
            onError={(e) => (e.target.src = "/bot.svg")}
          />
        </div>
        <Button
          className="text-md h-12 min-w-64"
          render={<Link to="/signin" />}
        >
          {m.welcome_login_button()}
        </Button>
        <footer className="flex items-center justify-center gap-3 text-xs md:text-sm">
          <div>
            {"Parkbot © "}
            {new Date().getFullYear()}{" "}
            <Link
              className="hover:text-blue-500 hover:underline"
              to="https://www.sotefin.com/"
            >
              Sotefin SA
            </Link>
          </div>
          <LocaleToggle />
          <ModeToggle />
        </footer>
      </div>
    </div>
  )
}
