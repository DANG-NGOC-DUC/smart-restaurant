"use client";

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  X,
  Shell,
  Armchair,
} from "lucide-react";
import { cn } from "../../lib/utils";
import logo from "../../assets/logo.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: UtensilsCrossed, label: "Menu", path: "/admin/menu" },
  { icon: ClipboardList, label: "Đơn hàng", path: "/admin/orders" },
  { icon: Armchair, label: "Bàn", path: "/admin/tables" },
  { icon: BarChart3, label: "Báo cáo", path: "/admin/reports" },
  { icon: Users, label: "Người dùng", path: "/admin/users" },
  { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
];

function Sidebar({ isOpen, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-sea-500 to-sea-700 text-white transition-all duration-300 hidden lg:block",
          isOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/20">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 object-cover rounded-full"
            />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight">Seafood</h1>
              <p className="text-xs text-sea-100">Vietnamese Cuisine</p>
            </div>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-coral-500 text-white font-medium shadow-md"
                    : "text-sea-100 hover:bg-white/10 hover:text-white",
                  !isOpen && "justify-center",
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-sea-500 to-sea-700 text-white transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Seafood</h1>
              <p className="text-xs text-sea-100">Vietnamese Cuisine</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-coral-500 text-white font-medium shadow-md"
                    : "text-sea-100 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
