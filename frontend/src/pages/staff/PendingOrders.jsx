import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { usePendingOrders } from "../../context/PendingOrdersContext";

function PendingOrders() {
  const { orders, loading, error, fetchOrders, approve, cancel, pendingCount } =
    usePendingOrders();

  const handleApprove = async (orderId) => {
    try {
      await approve(orderId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Hủy đơn này vì không có khách?")) return;
    try {
      await cancel(orderId);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatMoney = (amount) => {
    if (!amount || amount === 0) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading
  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Đang tải đơn chờ duyệt...</p>
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
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sea-700 bg-sea-50 rounded-lg hover:bg-sea-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    );
  }

  // Empty
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <ClipboardList className="w-12 h-12 mb-4 text-sea-300" />
        <h2 className="text-lg font-semibold text-slate-600 mb-2">
          Không có đơn chờ duyệt
        </h2>
        <p className="text-sm text-center px-8">
          Đơn từ khách quét QR sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700">
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full mr-2">
              {pendingCount}
            </span>
          )}
          {orders.length} đơn chờ duyệt
        </h2>
        <button
          onClick={fetchOrders}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Orders list */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden"
        >
          {/* Order header */}
          <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-sm text-slate-900">
                {order.table_name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(order.created_at)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="px-4 py-3 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-slate-900">{item.menu_item_name}</span>
                  {item.note && (
                    <span className="text-xs text-slate-400 ml-2 italic">
                      ({item.note})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-500">x{item.quantity}</span>
                  <span className="font-medium text-slate-700 w-20 text-right">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer: total + actions */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-900">
              Tổng: {formatMoney(order.total_price)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCancel(order.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 active:scale-95 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy đơn</span>
              </button>
              <button
                onClick={() => handleApprove(order.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-sea-600 text-white text-xs font-semibold rounded-lg hover:bg-sea-700 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Xác nhận đơn</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PendingOrders;
