import { NavLink } from "react-router-dom";
import { ChefHat, BarChart3, Ban } from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/chef",
    label: "Dashboard",
    icon: ChefHat,
    end: true,
  },

  {
    to: "/chef/statistics",
    label: "Thống kê",
    icon: BarChart3,
  },

  {
    to: "/chef/inventory",
    label: "Hết món",
    icon: Ban,
  },
];

function ChefBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pb-[env(safe-area-inset-bottom,16px)] pt-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {NAV_ITEMS.map((item) => (
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
                <div className="flex h-7 items-center justify-center">
                  <item.icon
                    className={`${isActive ? "w-7 h-7" : "w-6 h-6"}`}
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 1.5 : 2}
                  />
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
        ))}
      </div>
    </nav>
  );
}

export default ChefBottomNav;
