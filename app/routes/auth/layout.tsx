import { Outlet } from "react-router";
import { AuroraText } from "~/components/magicui/auroraText";

export default function Auth() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          {/* <div className="flex size-12 items-center justify-center rounded-md">
            <img src="bot.svg" alt="Parkbot" />
          </div> */}
          <h1 className="text-4xl font-bold tracking-tighter">
            <AuroraText>Parkbot</AuroraText> web service
          </h1>
        </a>
        <Outlet />
      </div>
      <span className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance">
        By clicking submit, you agree to our <a href="#">Terms of Service</a>
      </span>
      {/* <footer className="space-y-1.5">
        <p className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance">
          By clicking submit, you agree to our <a href="#">Terms of Service</a>
        </p>
        <p className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance">
          All rights reserved.{" © "}
          {new Date().getFullYear()}{" "}
          <a href="https://www.sotefin.com/" target="_blank">
            Sotefin SA
          </a>
        </p>
        <p className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance">
          Crafted with ❤️ in{" "}
          <a href="https://en.wikipedia.org/wiki/Switzerland" target="_blank">
            Switzerland
          </a>
        </p>
      </footer> */}
    </div>
  );
}
