import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { publicService } from "../../services/public.service";

const TIME_SLOTS = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

function generateDates(count = 7) {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dates = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    dates.push({
      date: d,
      label: i === 0 ? "Hôm nay" : days[d.getDay()],
      display: `${d.getDate()}/${d.getMonth() + 1}`,
    });
  }
  return dates;
}

export default function ReservationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dates = useMemo(() => generateDates(7), []);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Nếu chưa đăng nhập → chuyển sang trang login
  if (!user) {
    return (
      <div className="flex flex-col min-h-dvh bg-background-light">
        <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-slate-600">
                arrow_back
              </span>
            </button>
            <h1 className="text-lg font-bold text-primary">ĐẶT BÀN</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <span className="material-symbols-outlined text-primary/30 text-6xl mb-4">
            lock
          </span>
          <p className="text-slate-600 text-center mb-6">
            Bạn cần đăng nhập để đặt bàn trước
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

  // Đã đặt thành công
  if (success) {
    return (
      <div className="flex flex-col min-h-dvh bg-background-light">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-green-600 text-4xl">
              check_circle
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Đặt bàn thành công!
          </h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            Nhà hàng sẽ xác nhận lịch đặt bàn của bạn qua email.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            Xem menu
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selectedTime === null) {
      setError("Vui lòng chọn giờ.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const d = dates[selectedDate].date;
      const [hours, minutes] = TIME_SLOTS[selectedTime].split(":");
      const reservedAt = new Date(d);
      reservedAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await publicService.createReservation({
        reserved_at: reservedAt.toISOString(),
        guest_count: guestCount,
        note: note.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Đặt bàn thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user.full_name || user.user_metadata?.full_name || "bạn";

  return (
    <div className="relative flex flex-col min-h-dvh pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-2xl">
                arrow_back
              </span>
            </button>
            <h2 className="text-primary text-lg font-bold tracking-tight">
              ĐẶT BÀN
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full">
            <span className="text-xs font-semibold text-primary">
              Chào {userName}
            </span>
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
              {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                <img
                  src={
                    user.user_metadata.avatar_url || user.user_metadata.picture
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-xl">
                  account_circle
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Image */}
        <div className="px-4 py-2">
          <div className="w-full aspect-video bg-center bg-no-repeat bg-cover rounded-2xl shadow-md overflow-hidden bg-primary/10 flex items-center justify-center">
            <div className="text-center px-6">
              <span className="material-symbols-outlined text-primary/40 text-5xl">
                restaurant
              </span>
              <p className="text-primary/60 text-sm mt-2 font-medium">
                Đặt bàn trước để có trải nghiệm tốt nhất
              </p>
            </div>
          </div>
        </div>

        {/* Số khách */}
        <div className="mt-6 px-4">
          <h3 className="text-slate-900 text-base font-bold mb-3 uppercase tracking-wider">
            Số khách
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => setGuestCount(n)}
                className={`h-11 min-w-[44px] px-3 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                  guestCount === n
                    ? "bg-primary text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Date selection */}
        <div className="mt-6">
          <h3 className="text-slate-900 text-base font-bold px-4 mb-3 uppercase tracking-wider">
            Chọn ngày
          </h3>
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
            {dates.map((d, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(idx)}
                className={`flex h-11 shrink-0 items-center justify-center rounded-xl px-5 shadow-sm transition-colors ${
                  selectedDate === idx
                    ? "bg-primary text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold">
                  {d.label} {d.display}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Grid */}
        <div className="mt-8 px-4">
          <h3 className="text-slate-900 text-base font-bold mb-4 uppercase tracking-wider">
            Chọn giờ
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {TIME_SLOTS.map((time, idx) => (
              <button
                key={time}
                onClick={() => setSelectedTime(idx)}
                className={`py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  selectedTime === idx
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-accent/40"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Special request */}
        <div className="mt-8 px-4">
          <h3 className="text-slate-900 text-base font-bold mb-3 uppercase tracking-wider">
            Yêu cầu đặc biệt
          </h3>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm focus:ring-accent focus:border-accent placeholder:text-slate-400 text-slate-700"
            placeholder="VD: Cần ghế trẻ em, trang trí sinh nhật..."
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto p-4 bg-gradient-to-t from-background-light via-background-light to-transparent pt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedTime === null}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/30 transition-all active:scale-[0.98] uppercase tracking-widest text-base disabled:opacity-50"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : (
            "Xác nhận đặt bàn"
          )}
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
}
