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
      <span className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance ">
        By clicking submit, you agree to our <a href="#">Terms of Service.</a>
      </span>
      <footer className="text-center text-primary text-sm tracking-tighter">
        {"© "}
        {new Date().getFullYear()}{" "}
        <a
          className="hover:underline hover:text-blue-600"
          href="https://www.sotefin.com/"
        >
          Sotefin.
        </a>{" "}
        All rights reserved.
        {/* <br className="inline sm:hidden" /> Made with ❤️ in Switzerland. */}
      </footer>
    </div>
  );
}
