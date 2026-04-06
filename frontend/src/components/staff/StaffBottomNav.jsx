import { NavLink } from "react-router-dom";
import { LayoutGrid, Bell, ConciergeBell, ClipboardList } from "lucide-react";
import { useServiceRequests } from "../../context/ServiceRequestsContext";
import { usePendingItems } from "../../context/PendingItemsContext";
import { usePendingOrders } from "../../context/PendingOrdersContext";

const NAV_ITEMS = [
  {
    to: "/staff",
    label: "Sơ đồ bàn",
    icon: LayoutGrid,
    end: true,
    badgeKey: null,
  },
  {
    to: "/staff/pending",
    label: "Chờ duyệt",
    icon: ClipboardList,
    badgeKey: "pending_orders",
  },
  {
    to: "/staff/serve",
    label: "Phục vụ",
    icon: ConciergeBell,
    badgeKey: "pending_items",
  },
  {
    to: "/staff/alerts",
    label: "Thông báo",
    icon: Bell,
    badgeKey: "pending_requests",
  },
];

function StaffBottomNav() {
  const { pendingCount: requestCount } = useServiceRequests();
  const { items } = usePendingItems();
  const { pendingCount: orderCount } = usePendingOrders();

  const badgeCounts = {
    pending_orders: orderCount || 0,
    pending_items: items?.length || 0,
    pending_requests: requestCount || 0,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pb-[env(safe-area-inset-bottom,16px)] pt-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-end gap-1 transition-colors ${
                  isActive
                    ? "text-coral-600"
                    : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex h-7 items-center justify-center relative">
                    <item.icon
                      className={`${isActive ? "w-7 h-7" : "w-6 h-6"}`}
                      fill={isActive ? "currentColor" : "none"}
                      strokeWidth={isActive ? 1.5 : 2}
                    />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-crimson-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-0.5">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs leading-normal tracking-wide ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </p>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default StaffBottomNav;
