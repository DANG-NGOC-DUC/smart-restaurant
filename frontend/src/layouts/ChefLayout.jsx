import { Outlet } from "react-router-dom";
import ChefHeader from "../components/chef/ChefHeader";
import ChefBottomNav from "../components/chef/ChefBottomNav";

function ChefLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body text-slate-900">
      <ChefHeader />

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <ChefBottomNav />
    </div>
  );
}

export default ChefLayout;
