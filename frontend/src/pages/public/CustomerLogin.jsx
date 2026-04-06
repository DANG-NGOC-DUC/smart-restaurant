import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo2.png";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, logout, loading, error } = useAuth();

  // Nếu đã đăng nhập → hiện profile
  if (user) {
    const avatar =
      user.user_metadata?.avatar_url || user.user_metadata?.picture;
    return (
      <div className="flex flex-col min-h-dvh bg-background-light">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-slate-600">
                arrow_back
              </span>
            </button>
            <h1 className="text-lg font-bold text-slate-800">Tài khoản</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center px-6 pt-10">
          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover shadow-md mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">
                person
              </span>
            </div>
          )}

          <h2 className="text-lg font-bold text-slate-800">
            {user.full_name || user.user_metadata?.full_name || "Khách"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>

          {/* Actions */}
          <div className="mt-8 w-full max-w-xs space-y-3">
            <button
              onClick={() => navigate("/reservation")}
              className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                calendar_month
              </span>
              <span>Đặt bàn trước</span>
            </button>
            <button
              onClick={() => navigate("/my-reservations")}
              className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-xl text-primary">
                list_alt
              </span>
              <span>Xem lịch đặt bàn</span>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate("/menu", { replace: true });
            }}
            className="mt-3 w-full max-w-xs flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → trang login Google
  return (
    <div className="flex flex-col min-h-dvh bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-slate-600">
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">Đăng nhập</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo + Branding */}
        <img
          src={logo}
          alt="Logo"
          className="w-20 h-20 rounded-full object-cover shadow-md mb-6"
        />
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Chào mừng đến Seafood
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 max-w-[280px]">
          Đăng nhập để lưu lịch sử đơn, tích điểm và đánh giá món ăn
        </p>

        {/* Error */}
        {error && (
          <div className="w-full max-w-xs mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full max-w-xs flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium text-slate-700">
            {loading ? "Đang xử lý..." : "Tiếp tục với Google"}
          </span>
        </button>

        <p className="text-xs text-slate-400 mt-6 text-center max-w-[260px]">
          Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng của chúng tôi
        </p>
      </div>
    </div>
  );
}
