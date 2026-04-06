import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="relative flex flex-col min-h-dvh w-full max-w-md mx-auto shadow-xl bg-background-light font-display text-slate-900 antialiased">
      <Outlet />
    </div>
  );
}
