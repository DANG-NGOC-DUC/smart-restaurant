"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";

function Header({ onToggleSidebar, onMobileMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          <NotificationBell />

          {/* User */}
          <div
            className="relative flex items-center gap-3 pl-3 border-l border-sea-100"
            ref={dropdownRef}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-sea-800">Admin</p>
              <p className="text-xs text-sea-500">Quản lý</p>
            </div>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-9 h-9 bg-gradient-to-br from-sea-500 to-sea-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sea-400"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-sea-100 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
