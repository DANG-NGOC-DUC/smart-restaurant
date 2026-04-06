import {
  Users,
  Armchair,
  UtensilsCrossed,
  DollarSign,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TableCard({ table, onRequestBill }) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (fn) => {
    setActionLoading(true);
    try {
      await fn();
    } catch {
      // Error handled by parent
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (amount) => {
    if (!amount || amount === 0) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // ── OCCUPIED ───────────────────────────────────
  if (table.status === "occupied") {
    return (
      <div
        onClick={() => navigate(`/staff/table/${table.id}`)}
        className="bg-white rounded-xl p-4 shadow-sm border-2 border-coral-500 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="absolute top-0 right-0 bg-coral-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
          Đang dùng
        </div>

        <div className="flex flex-col h-full justify-between gap-3">
          <div className="flex items-start">
            <div className="h-10 w-10 rounded-lg bg-coral-50 flex items-center justify-center text-coral-500">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {table.name || `Bàn ${table.code}`}
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Bắt đầu: {formatTime(table.session_started_at)}
            </span>
            <div className="flex items-center gap-1 text-sm text-coral-600 font-medium mt-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{formatMoney(table.total_amount)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-1 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/staff/order/${table.id}`);
              }}
              className="flex-1 py-1.5 bg-sea-50 text-sea-700 text-xs font-semibold rounded hover:bg-sea-100 transition-colors flex items-center justify-center gap-1"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Đặt món</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onRequestBill(table.id));
              }}
              disabled={actionLoading}
              className="flex-1 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{actionLoading ? "..." : "Thanh toán"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY ──────────────────────────────────────
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
      <div className="flex flex-col h-full justify-between gap-3">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
            <Armchair className="w-5 h-5" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-400 mb-1">
            {table.name || `Bàn ${table.code}`}
          </h3>
          <p className="text-sm text-slate-400 font-medium">
            {table.capacity} chỗ ngồi · Trống
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 mt-1">
          <button
            onClick={() => navigate(`/staff/order/${table.id}`)}
            className="w-full py-1.5 border border-dashed border-slate-300 text-slate-400 text-xs font-medium rounded hover:bg-slate-50 hover:text-sea-600 hover:border-sea-300 transition-colors flex items-center justify-center gap-1"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Đặt món</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
