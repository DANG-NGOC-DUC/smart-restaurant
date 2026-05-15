import { LogOut, Monitor, User, UtensilsCrossed } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

function StaffHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    user?.full_name || user?.user_metadata?.full_name || "Phục vụ";
  const resolvedRole = user?.role || user?.db_role;
  const hasCashierPermission = Array.isArray(user?.permissions)
    ? user.permissions.some((permission) =>
        String(permission).startsWith("cashier."),
      )
    : false;
  const canAccessPos = resolvedRole === "admin" || hasCashierPermission;
  const isStaffMode = location.pathname.startsWith("/staff");

  const handleLogout = () => {
    if (!window.confirm("Bạn có chắc muốn đăng xuất?")) return;
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-sea-800 text-white px-4 shadow-md flex items-center justify-between h-16">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-10 rounded-full object-cover border border-white/20"
        />
        <div>
          <p className="text-xs text-white/70 font-medium uppercase tracking-wider">
            Seafood
          </p>
          <h1 className="text-lg font-bold leading-none">Vietnamese Cuisine</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {canAccessPos && (
          <div className="flex items-center bg-white/10 rounded-full border border-white/10 p-1">
            <button
              type="button"
              onClick={() => navigate("/staff")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                isStaffMode
                  ? "bg-white text-sea-800"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Phục vụ
            </button>
            <button
              type="button"
              onClick={() => navigate("/cashier")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                !isStaffMode
                  ? "bg-white text-sea-800"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              POS
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium truncate max-w-[140px]">
            {displayName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default StaffHeader;
