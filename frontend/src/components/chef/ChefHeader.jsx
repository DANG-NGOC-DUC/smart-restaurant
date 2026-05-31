import { ChefHat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

function ChefHeader() {
  const { user } = useAuth();

  const displayName =
    user?.full_name || user?.user_metadata?.full_name || "Nhân viên bếp";

  return (
    <header className="sticky top-0 z-50 bg-sea-800 text-white px-4 shadow-md flex items-center justify-between h-16">
      {/* Logo + tên nhà hàng */}
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

      {/* Thông tin bếp */}
      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
        <ChefHat className="w-4 h-4" />
        <span className="text-sm font-medium truncate max-w-[140px]">
          {displayName}
        </span>
      </div>
    </header>
  );
}

export default ChefHeader;
