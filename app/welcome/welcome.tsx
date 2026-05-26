import botDark from "./bot-dark.svg";
import botLight from "./bot-light.svg";
import { Button } from "~/components/ui/button";
import { AuroraText } from "~/components/aurora-text";
import { ModeToggle } from "~/components/mode-toggle";
import { m } from "@paraglide/messages.js";
import { getLocale, setLocale } from "@paraglide/runtime.js";

export function Welcome() {
  return (
    <div className="flex items-center justify-center h-screen px-3">
      <div className="flex flex-col gap-4 items-center text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">
          <AuroraText>Parkbot</AuroraText>
          <span className="inline md:hidden"> App</span>
          <span className="hidden md:inline"> Web Service</span>
        </h1>
        <h2 className="text-xl md:text-3xl">{m.welcome_text()}</h2>
        <div className="h-64 w-64">
          <img src={botDark} alt="Parkbot" className="hidden dark:block" />
          <img src={botLight} alt="Parkbot" className="block dark:hidden" />
        </div>
        <div className="flex flex-col gap-4">
          <Button className="w-48" size="lg" variant="outline" asChild>
            <a href="/signin">{m.welcome_login_button()}</a>
          </Button>
          <div className="flex justify-center items-center gap-6">
            <Button onClick={() => setLocale("en")} variant="icon">
              EN
            </Button>
            <Button onClick={() => setLocale("it")} variant="icon">
              IT
            </Button>
            <ModeToggle />
          </div>
        </div>
        <footer className="text-xs md:text-sm">
          {"Parkbot © "}
          {new Date().getFullYear()}{" "}
          <a
            className="hover:underline hover:text-blue-500"
            href="https://www.sotefin.com/"
          >
            Sotefin SA
          </a>
        </footer>
      </div>
    </div>
  );
}
