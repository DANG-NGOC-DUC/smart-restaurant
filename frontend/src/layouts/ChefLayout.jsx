"use client";

import { Outlet } from "react-router-dom";
import ChefHeader from "../components/chef/ChefHeader";
import ChefBottomNav from "../components/chef/ChefBottomNav";
import { PendingOrdersProvider } from "../context/PendingOrdersContext";

function ChefLayout() {
  return (
    <PendingOrdersProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-body text-slate-900 antialiased selection:bg-sea-500/20">
        <ChefHeader />

        <main className="flex-1 pb-24">
          <Outlet />
        </main>

        <ChefBottomNav />
      </div>
    </PendingOrdersProvider>
  );
}

export default ChefLayout;
