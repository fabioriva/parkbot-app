import { Outlet } from "react-router";

export default function Aps() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Outlet />
    </div>
  );
}
