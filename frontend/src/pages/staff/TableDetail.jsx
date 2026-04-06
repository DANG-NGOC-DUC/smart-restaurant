import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  UtensilsCrossed,
  Receipt,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChefHat,
} from "lucide-react";
import * as staffService from "../../services/staff.service";

const STATUS_MAP = {
  preparing: {
    label: "Đang nấu",
    color: "bg-amber-100 text-amber-700",
    icon: ChefHat,
  },
  served: {
    label: "Đã lên",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Đã huỷ",
    color: "bg-red-100 text-red-600",
    icon: XCircle,
  },
};

export default function TableDetail() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getTableDetail(tableId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải thông tin bàn");
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const formatMoney = (amount) => {
    if (!amount || amount === 0) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Đang tải thông tin bàn...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertTriangle className="w-8 h-8 mb-3 text-coral-500" />
        <p className="text-sm text-slate-600 mb-3">{error}</p>
        <button
          onClick={fetchDetail}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sea-700 bg-sea-50 rounded-lg hover:bg-sea-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const tableName = data.table_name;
  const isOccupied = data.status === "occupied";

  // Gom tất cả items từ tất cả orders (flat list) để thống kê
  const allItems = data.orders?.flatMap((o) => o.items) || [];
  const processingCount = allItems.filter(
    (i) => i.status === "preparing",
  ).length;
  const servedCount = allItems.filter((i) => i.status === "served").length;
  const cancelledCount = allItems.filter(
    (i) => i.status === "cancelled",
  ).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-10">
        <button
          onClick={() => navigate("/staff")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-slate-900">{tableName}</h1>
          <p className="text-xs text-slate-500">
            {isOccupied
              ? `Từ ${formatTime(data.session?.started_at)}`
              : "Bàn trống"}
          </p>
        </div>
        <button
          onClick={fetchDetail}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4 pb-28">
        {/* Summary card */}
        {isOccupied && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-coral-500" />
                <span className="text-xl font-bold text-slate-900">
                  {formatMoney(data.total_amount)}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {allItems.length} món
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              {processingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                  <ChefHat className="w-3 h-3" />
                  {processingCount} đang nấu
                </span>
              )}
              {servedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {servedCount} đã lên
                </span>
              )}
              {cancelledCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                  <XCircle className="w-3 h-3" />
                  {cancelledCount} đã huỷ
                </span>
              )}
            </div>
          </div>
        )}

        {/* Orders list */}
        {!isOccupied && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <UtensilsCrossed className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Bàn chưa có khách
            </p>
          </div>
        )}

        {data.orders?.map((order, idx) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Order header */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Đơn #{idx + 1}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    order.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "completed"
                        ? "bg-slate-100 text-slate-600"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {order.status === "active"
                    ? "Đang phục vụ"
                    : order.status === "completed"
                      ? "Hoàn thành"
                      : order.status === "cancelled"
                        ? "Đã huỷ"
                        : order.status}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {formatTime(order.created_at)}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => {
                const statusInfo =
                  STATUS_MAP[item.status] || STATUS_MAP.preparing;
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3 flex items-center gap-3 ${
                      item.status === "cancelled" ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-medium truncate ${
                            item.status === "cancelled"
                              ? "line-through text-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          {item.menu_item_name}
                        </h4>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">
                          x{item.quantity}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {formatMoney(item.price * item.quantity)}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-slate-400 mt-0.5 italic truncate">
                          "{item.note}"
                        </p>
                      )}
                      {item.status === "cancelled" && item.cancel_reason && (
                        <p className="text-xs text-red-400 mt-0.5">
                          Lý do: {item.cancel_reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      {isOccupied && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 z-40">
          <button
            onClick={() => navigate(`/staff/order/${tableId}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-sea-600 text-white text-sm font-semibold rounded-xl hover:bg-sea-700 active:scale-[0.98] transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Đặt thêm món
          </button>
          <button
            onClick={async () => {
              try {
                await staffService.createPaymentRequest(tableId);
                alert("Đã gửi yêu cầu thanh toán.");
              } catch (err) {
                alert(err.response?.data?.error || "Gửi yêu cầu thất bại.");
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            <Receipt className="w-4 h-4" />
            Thanh toán
          </button>
        </div>
      )}

      {!isOccupied && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
          <button
            onClick={() => navigate(`/staff/order/${tableId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-sea-600 text-white text-sm font-semibold rounded-xl hover:bg-sea-700 active:scale-[0.98] transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Đặt món
          </button>
        </div>
      )}
    </div>
  );
}
