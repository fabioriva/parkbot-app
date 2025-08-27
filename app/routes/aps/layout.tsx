import { Link, Outlet } from "react-router";

export default function Aps() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Outlet />
        <Link className="underline underline-offset-4" to="/logout">
          Logout
        </Link>
      </div>
    </div>
  );
}
