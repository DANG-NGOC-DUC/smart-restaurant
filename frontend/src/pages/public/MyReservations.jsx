import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { publicService } from "../../services/public.service";

const STATUS_MAP = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
    icon: "schedule",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-green-100 text-green-700",
    icon: "check_circle",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-600",
    icon: "cancel",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-slate-100 text-slate-500",
    icon: "done_all",
  },
};

export default function MyReservations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    publicService
      .getMyReservations()
      .then((res) => setReservations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (id) => {
    if (!confirm("Bạn chắc chắn muốn hủy đặt bàn?")) return;
    setCancellingId(id);
    try {
      await publicService.cancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)),
      );
    } catch {
      alert("Hủy thất bại. Vui lòng thử lại.");
    } finally {
      setCancellingId(null);
    }
  };

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className="flex flex-col min-h-dvh bg-background-light">
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
            <h1 className="text-lg font-bold text-primary">Lịch đặt bàn</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <span className="material-symbols-outlined text-primary/30 text-6xl mb-4">
            lock
          </span>
          <p className="text-slate-600 text-center mb-6">
            Đăng nhập để xem lịch đặt bàn
          </p>
          <button
            onClick={() => navigate("/account")}
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const pending = reservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed",
  );
  const past = reservations.filter(
    (r) => r.status === "cancelled" || r.status === "completed",
  );

  return (
    <div className="flex flex-col min-h-dvh bg-background-light pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-slate-600">
                arrow_back
              </span>
            </button>
            <h1 className="text-lg font-bold text-primary">Lịch đặt bàn</h1>
          </div>
          <button
            onClick={() => navigate("/reservation")}
            className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Đặt bàn
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined text-slate-200 text-7xl mb-4">
              event_busy
            </span>
            <p className="text-slate-500 font-medium mb-1">
              Chưa có lịch đặt bàn
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Đặt bàn trước để có trải nghiệm tốt nhất
            </p>
            <button
              onClick={() => navigate("/reservation")}
              className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">
                calendar_month
              </span>
              Đặt bàn ngay
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {pending.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Sắp tới
                </h3>
                <div className="space-y-3">
                  {pending.map((r) => (
                    <ReservationCard
                      key={r.id}
                      r={r}
                      onCancel={handleCancel}
                      cancellingId={cancellingId}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Lịch sử
                </h3>
                <div className="space-y-3">
                  {past.map((r) => (
                    <ReservationCard
                      key={r.id}
                      r={r}
                      onCancel={handleCancel}
                      cancellingId={cancellingId}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ r, onCancel, cancellingId }) {
  const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
  const date = new Date(r.reserved_at);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
            <span className="text-primary font-bold text-sm leading-none">
              {date.getDate()}
            </span>
            <span className="text-primary/60 text-[10px] font-medium">
              Th{date.getMonth() + 1}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {date.toLocaleDateString("vi-VN", { weekday: "long" })}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <span className="material-symbols-outlined text-xs">
                  schedule
                </span>
                {date.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <span className="material-symbols-outlined text-xs">group</span>
                {r.guest_count || 2} khách
              </span>
            </div>
            {r.note && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                <span className="material-symbols-outlined text-xs align-middle mr-0.5">
                  edit_note
                </span>
                {r.note}
              </p>
            )}
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${st.color}`}
        >
          {st.label}
        </span>
      </div>
      {r.status === "pending" && (
        <button
          onClick={() => onCancel(r.id)}
          disabled={cancellingId === r.id}
          className="mt-3 w-full text-xs font-medium text-red-500 border border-red-200 rounded-xl py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {cancellingId === r.id ? "Đang hủy..." : "Hủy đặt bàn"}
        </button>
      )}
    </div>
  );
}
