import { Outlet } from "react-router"
import { AuroraText } from "~/components/aurora-text"

export default function Auth() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 px-3">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <h1 className="text-3xl font-extrabold tracking-tighter md:text-4xl">
            <AuroraText>Parkbot</AuroraText> auth service
          </h1>
        </a>
        <Outlet />
      </div>
      <span className="text-center text-xs text-balance text-muted-foreground *:[a]:hover:text-primary">
        By clicking submit, you agree to our <a href="#">Terms of Service</a>
      </span>
    </div>
  )
}
