"use client";

import { Menu, Search, Bell, User } from "lucide-react";

function Header({ onToggleSidebar, onMobileMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-sea-100 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuClick}
            className="p-2 hover:bg-sea-50 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5 text-sea-800" />
          </button>

          {/* Desktop toggle button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-sea-50 rounded-lg hidden lg:block"
          >
            <Menu className="w-5 h-5 text-sea-800" />
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-64 pl-9 pr-4 py-2 bg-sea-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative p-2 hover:bg-sea-50 rounded-lg">
            <Bell className="w-5 h-5 text-sea-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-coral-500 rounded-full"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-3 border-l border-sea-100">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-sea-800">Admin</p>
              <p className="text-xs text-sea-500">Quản lý</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-sea-500 to-sea-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
