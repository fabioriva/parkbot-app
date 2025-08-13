import { Outlet } from "react-router";
// import { AuroraText } from "~/components/magicui/aurora-text";

export default function Auth() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          {/* <div className="flex size-12 items-center justify-center rounded-md">
            <img src="bot.svg" alt="Parkbot" />
          </div> */}
          <h1 className="text-3xl font-bold tracking-tighter">
            {/* <AuroraText>Parkbot</AuroraText> web service */}
            Parkbot web service
          </h1>
        </a>
        <Outlet />
      </div>
      <span className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance ">
        By clicking submit, you agree to our <a href="#">Terms of Service</a>
      </span>
    </div>
  );
}
