import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  Bell,
  BellOff,
  Clock,
  Hand,
  Receipt,
  HelpCircle,
  CheckCircle2,
  UserCheck,
  MapPin,
} from "lucide-react";
import { useServiceRequests } from "../../context/ServiceRequestsContext";

const REQUEST_TYPE_MAP = {
  call_waiter: {
    label: "Gọi nhân viên",
    icon: Hand,
    color: "text-coral-600 bg-coral-50",
  },
  need_help: {
    label: "Cần hỗ trợ",
    icon: HelpCircle,
    color: "text-blue-600 bg-blue-50",
  },
  request_bill: {
    label: "Yêu cầu thanh toán",
    icon: Receipt,
    color: "text-amber-600 bg-amber-50",
  },
  other: {
    label: "Yêu cầu khác",
    icon: HelpCircle,
    color: "text-slate-600 bg-slate-100",
  },
};

function Alerts() {
  const {
    requests,
    loading,
    error,
    fetchRequests,
    acknowledge,
    resolve,
    pendingCount,
  } = useServiceRequests();

  const handleAcknowledge = async (id) => {
    try {
      await acknowledge(id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolve(id);
    } catch (err) {
      alert(err.message);
    }
  };

  // Loading
  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Đang tải yêu cầu...</p>
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
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sea-700 bg-sea-50 rounded-lg hover:bg-sea-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    );
  }

  // Empty
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <BellOff className="w-12 h-12 mb-4 text-sea-300" />
        <h2 className="text-lg font-semibold text-slate-600 mb-2">
          Không có yêu cầu nào
        </h2>
        <p className="text-sm text-center px-8">
          Yêu cầu từ khách hàng sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700">
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-crimson-500 text-white rounded-full mr-2">
              {pendingCount}
            </span>
          )}
          {requests.length} yêu cầu đang xử lý
        </h2>
        <button
          onClick={fetchRequests}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Requests list */}
      {requests.map((req) => {
        const typeInfo =
          REQUEST_TYPE_MAP[req.request_type] || REQUEST_TYPE_MAP.other;
        const TypeIcon = typeInfo.icon;
        const isPending = req.status === "pending";

        return (
          <div
            key={req.id}
            className={`bg-white rounded-xl p-4 shadow-sm border ${
              isPending ? "border-coral-200 bg-coral-50/30" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Type icon */}
              <div
                className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${typeInfo.color}`}
              >
                <TypeIcon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">
                    {typeInfo.label}
                  </span>
                  {isPending && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-coral-100 text-coral-700 rounded">
                      MỚI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {req.table_name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    {req.waiting_minutes} phút
                  </span>
                </div>
                {req.note && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">
                    "{req.note}"
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
              {isPending ? (
                <button
                  onClick={() => handleAcknowledge(req.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sea-600 text-white text-xs font-semibold rounded-lg hover:bg-sea-700 active:scale-95 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Nhận xử lý
                </button>
              ) : (
                <button
                  onClick={() => handleResolve(req.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Hoàn tất
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Alerts;
