import { Outlet } from "react-router-dom";
import StaffHeader from "../components/staff/StaffHeader";
import StaffBottomNav from "../components/staff/StaffBottomNav";
import { PendingItemsProvider } from "../context/PendingItemsContext";
import { PendingOrdersProvider } from "../context/PendingOrdersContext";
import { ServiceRequestsProvider } from "../context/ServiceRequestsContext";

function StaffLayout() {
  return (
    <PendingItemsProvider>
      <PendingOrdersProvider>
        <ServiceRequestsProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col font-body text-slate-900 antialiased selection:bg-sea-500/20">
            <StaffHeader />

            <main className="flex-1 pb-24">
              <Outlet />
            </main>

            <StaffBottomNav />
          </div>
        </ServiceRequestsProvider>
      </PendingOrdersProvider>
    </PendingItemsProvider>
  );
}

export default StaffLayout;
