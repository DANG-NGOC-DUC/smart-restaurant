"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Ban,
  CircleCheck,
  Utensils,
  UtensilsCrossed,
  Hash,
  PlayCircle,
  History,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useAdminOrders } from "../../hooks/admin/order";
import { useOrderHistory } from "../../hooks/admin/useOrderHistory";

const statusConfig = {
  pending: {
    label: "Cho duyet",
    color: "bg-gold-100 text-gold-700",
    dotColor: "bg-gold-500",
    icon: Clock,
  },
  active: {
    label: "Dang phuc vu",
    color: "bg-sea-100 text-sea-700",
    dotColor: "bg-sea-500",
    icon: PlayCircle,
  },
  completed: {
    label: "Hoan thanh",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
    icon: CircleCheck,
  },
  cancelled: {
    label: "Da huy",
    color: "bg-crimson-100 text-crimson-700",
    dotColor: "bg-crimson-500",
    icon: XCircle,
  },
};

const nextStatusMap = {
  pending: ["active", "cancelled"],
  active: ["completed", "cancelled"],
};

const filterTabs = [
  { key: "all", label: "Tat ca" },
  { key: "pending", label: "Cho duyet" },
  { key: "active", label: "Dang phuc vu" },
  { key: "completed", label: "Hoan thanh" },
  { key: "cancelled", label: "Da huy" },
];

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

// Xác định trạng thái ưu tiên cao nhất của bàn dựa trên các đơn
function getTablePriorityStatus(tableOrders) {
  if (tableOrders.some((o) => o.status === "pending")) return "pending";
  if (tableOrders.some((o) => o.status === "active")) return "active";
  if (tableOrders.every((o) => o.status === "completed")) return "completed";
  if (tableOrders.every((o) => o.status === "cancelled")) return "cancelled";
  return "completed";
}

function Orders() {
  const [mainTab, setMainTab] = useState("current"); // "current" | "history"

  return (
    <div className="space-y-6">
      {/* Main tab switcher */}
      <div className="flex items-center gap-1 bg-sea-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMainTab("current")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mainTab === "current"
              ? "bg-white text-sea-800 shadow-sm"
              : "text-sea-500 hover:text-sea-700"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Don hien tai
        </button>
        <button
          onClick={() => setMainTab("history")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mainTab === "history"
              ? "bg-white text-sea-800 shadow-sm"
              : "text-sea-500 hover:text-sea-700"
          }`}
        >
          <History className="w-4 h-4" />
          Lich su
        </button>
      </div>

      {mainTab === "current" ? <CurrentOrdersTab /> : <HistoryTab />}
    </div>
  );
}

/* ================================================================
   CURRENT ORDERS TAB — giữ nguyên logic cũ
   ================================================================ */
function CurrentOrdersTab() {
  const {
    orders,
    loading,
    mutating,
    error,
    stats,
    refresh,
    fetchOrderDetail,
    updateStatus,
  } = useAdminOrders();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // null = table grid view, string = table_name selected
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Group orders by table_name
  const tableGroups = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const key = order.table_name || "Chua gan ban";
      if (!map[key]) {
        map[key] = {
          table_name: key,
          orders: [],
          totalPrice: 0,
          totalItems: 0,
        };
      }
      map[key].orders.push(order);
      map[key].totalPrice += Number(order.total_price || 0);
      map[key].totalItems += Number(order.item_count || 0);
    });
    // Sort: tables with active orders first
    return Object.values(map).sort((a, b) => {
      const aPriority = getTablePriorityStatus(a.orders);
      const bPriority = getTablePriorityStatus(b.orders);
      const priorityOrder = ["pending", "active", "completed", "cancelled"];
      return (
        priorityOrder.indexOf(aPriority) - priorityOrder.indexOf(bPriority)
      );
    });
  }, [orders]);

  // Filtered table groups
  const filteredTableGroups = useMemo(() => {
    return tableGroups.filter((group) => {
      const matchFilter =
        selectedFilter === "all" ||
        group.orders.some((o) => o.status === selectedFilter);
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || group.table_name.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [tableGroups, selectedFilter, searchQuery]);

  // Orders for selected table (filtered by status tab)
  const selectedTableOrders = useMemo(() => {
    if (!selectedTable) return [];
    const group = tableGroups.find((g) => g.table_name === selectedTable);
    if (!group) return [];
    if (selectedFilter === "all") return group.orders;
    return group.orders.filter((o) => o.status === selectedFilter);
  }, [selectedTable, tableGroups, selectedFilter]);

  // Open detail modal
  const handleViewDetail = async (order) => {
    setDetailLoading(true);
    try {
      const detail = await fetchOrderDetail(order.id);
      setSelectedOrder(detail);
    } catch {
      showToast("error", "Khong the tai chi tiet don hang");
    } finally {
      setDetailLoading(false);
    }
  };

  // Change status
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      }
      showToast(
        "success",
        `Da chuyen trang thai sang "${statusConfig[newStatus]?.label || newStatus}"`,
      );
    } catch (err) {
      showToast("error", err.message);
    }
  };

  // Cancel with confirmation
  const handleCancelOrder = (orderId) => {
    setCancelConfirm(orderId);
  };

  const confirmCancel = async () => {
    if (!cancelConfirm) return;
    try {
      await updateStatus(cancelConfirm, "cancelled");
      if (selectedOrder && selectedOrder.id === cancelConfirm) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "cancelled" } : prev,
        );
      }
      showToast("success", "Da huy don hang thanh cong");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setCancelConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sea-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-crimson-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedTable && (
            <button
              onClick={() => setSelectedTable(null)}
              className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-sea-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-sea-800">
              {selectedTable ? selectedTable : "Quan ly Don hang"}
            </h1>
            <p className="text-sea-500">
              {selectedTable
                ? `${selectedTableOrders.length} don hang`
                : "Chon ban de xem chi tiet don hang"}
            </p>
          </div>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sea-200 rounded-lg text-sea-700 hover:bg-sea-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Lam moi
        </button>
      </div>

      {error && (
        <div className="p-3 bg-crimson-50 border border-crimson-200 rounded-lg text-crimson-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gold-50 border border-gold-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-gold-600">{stats.pending}</p>
          <p className="text-sm text-gold-700">Cho duyet</p>
        </div>
        <div className="bg-sea-50 border border-sea-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-sea-600">{stats.active}</p>
          <p className="text-sm text-sea-700">Dang phuc vu</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-green-700">Hoan thanh</p>
        </div>
        <div className="bg-crimson-50 border border-crimson-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-crimson-600">
            {stats.cancelled}
          </p>
          <p className="text-sm text-crimson-700">Da huy</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {!selectedTable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
              <input
                type="text"
                placeholder="Tim kiem theo ten ban..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
            </div>
          )}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === tab.key
                    ? "bg-sea-500 text-white"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {tab.label}
                {tab.key !== "all" && stats[tab.key] > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                    {stats[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== TABLE GRID VIEW ==================== */}
      {!selectedTable && (
        <>
          {filteredTableGroups.length === 0 ? (
            <div className="text-center py-12 text-sea-400">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">
                Khong co ban nao co don hang
              </p>
              <p className="text-sm">Thu thay doi bo loc hoac tim kiem</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTableGroups.map((group) => {
                const priorityStatus = getTablePriorityStatus(group.orders);
                const cfg = statusConfig[priorityStatus] || statusConfig.active;
                const activeOrders = group.orders.filter(
                  (o) => o.status === "active",
                );

                return (
                  <button
                    key={group.table_name}
                    onClick={() => setSelectedTable(group.table_name)}
                    className="bg-white rounded-xl shadow-card border border-sea-100 p-5 hover:shadow-card-hover hover:border-sea-300 transition-all text-left group relative overflow-hidden"
                  >
                    {/* Pulse dot for active orders */}
                    {activeOrders.length > 0 && (
                      <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sea-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sea-500" />
                      </span>
                    )}

                    {/* Table icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cfg.color}`}
                    >
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>

                    {/* Table name */}
                    <p className="font-bold text-sea-800 text-base mb-1 truncate">
                      {group.table_name}
                    </p>

                    {/* Status summary */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className={`w-2 h-2 rounded-full ${cfg.dotColor}`}
                      />
                      <span className="text-xs text-sea-500">{cfg.label}</span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-xs text-sea-500 border-t border-sea-100 pt-3">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>
                          {activeOrders.length > 0
                            ? `${activeOrders.length} don dang xu ly`
                            : `${group.orders.length} don`}
                        </span>
                      </div>
                    </div>

                    {/* Total price */}
                    <p className="text-sm font-bold text-coral-600 mt-2">
                      {group.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ==================== TABLE DETAIL VIEW (orders list) ==================== */}
      {selectedTable && (
        <>
          {selectedTableOrders.length === 0 ? (
            <div className="text-center py-12 text-sea-400">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Khong co don hang nao</p>
              <p className="text-sm">Thu thay doi bo loc trang thai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTableOrders.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.active;
                const StatusIcon = cfg.icon;
                const nextStatuses = nextStatusMap[order.status] || [];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="p-4 flex items-center justify-between border-b border-sea-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sea-100 rounded-lg flex items-center justify-center">
                          <Hash className="w-5 h-5 text-sea-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-sea-800 text-sm">
                            Don #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-sea-500">
                            {formatTime(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Order body */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-sea-500">So mon:</span>
                        <span className="font-medium text-sea-700">
                          {order.item_count || 0} mon
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-coral-600">
                          {Number(order.total_price || 0).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </p>
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sea-600 hover:bg-sea-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiet
                        </button>
                      </div>

                      {/* Action buttons */}
                      {nextStatuses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-sea-100 flex gap-2">
                          {nextStatuses
                            .filter((s) => s !== "cancelled")
                            .map((ns) => (
                              <button
                                key={ns}
                                onClick={() => handleChangeStatus(order.id, ns)}
                                disabled={mutating}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors disabled:opacity-50"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                {statusConfig[ns]?.label}
                              </button>
                            ))}
                          {nextStatuses.includes("cancelled") && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={mutating}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-crimson-50 text-crimson-600 rounded-lg hover:bg-crimson-100 transition-colors disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Huy
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Order detail modal */}
      {(selectedOrder || detailLoading) && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-sea-500 animate-spin" />
              </div>
            ) : (
              selectedOrder && (
                <>
                  <div className="p-6 border-b border-sea-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-sea-800">
                          Chi tiet don hang
                        </h2>
                        <p className="text-sea-500 text-sm">
                          Don #{selectedOrder.id.slice(0, 8)} —{" "}
                          {selectedOrder.table_name || "Chua gan ban"}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 hover:bg-sea-100 rounded-lg"
                      >
                        <XCircle className="w-5 h-5 text-sea-400" />
                      </button>
                    </div>
                    {/* Status badge */}
                    <div className="mt-3">
                      {(() => {
                        const cfg =
                          statusConfig[selectedOrder.status] ||
                          statusConfig.active;
                        const Icon = cfg.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}
                          >
                            <Icon className="w-4 h-4" />
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Items list */}
                    <div className="space-y-3 mb-6">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between py-2 border-b border-sea-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sea-700">
                                {item.menu_item_name || "Mon an"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-sea-500">
                                <span>x{item.quantity}</span>
                                {item.note && (
                                  <span className="text-gold-600">
                                    • {item.note}
                                  </span>
                                )}
                                {item.status === "cancelled" && (
                                  <span className="text-crimson-500 font-medium">
                                    (Da huy)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="font-medium text-sea-700 whitespace-nowrap">
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between py-4 border-t border-sea-200">
                      <span className="font-semibold text-sea-800">
                        Tong cong:
                      </span>
                      <span className="text-xl font-bold text-coral-600">
                        {Number(selectedOrder.total_price || 0).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </span>
                    </div>

                    {/* Time info */}
                    <div className="text-sm text-sea-500 mb-4">
                      Tao luc: {formatTime(selectedOrder.created_at)}
                    </div>

                    {/* Status action buttons in modal */}
                    {(() => {
                      const nextStatuses =
                        nextStatusMap[selectedOrder.status] || [];
                      if (nextStatuses.length === 0) return null;
                      return (
                        <div className="flex gap-3 mt-4">
                          {nextStatuses
                            .filter((s) => s !== "cancelled")
                            .map((ns) => (
                              <button
                                key={ns}
                                onClick={() =>
                                  handleChangeStatus(selectedOrder.id, ns)
                                }
                                disabled={mutating}
                                className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                              >
                                <ArrowRight className="w-4 h-4" />
                                {statusConfig[ns]?.label}
                              </button>
                            ))}
                          {nextStatuses.includes("cancelled") && (
                            <button
                              onClick={() =>
                                handleCancelOrder(selectedOrder.id)
                              }
                              disabled={mutating}
                              className="flex-1 py-2.5 bg-crimson-50 text-crimson-600 rounded-lg font-medium hover:bg-crimson-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              Huy don
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-sea-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-crimson-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-crimson-600" />
              </div>
              <h3 className="text-lg font-bold text-sea-800">Xac nhan huy</h3>
            </div>
            <p className="text-sea-600 mb-6">
              Ban co chac muon huy don hang nay? Neu don da xac nhan, nguyen
              lieu se duoc hoan lai kho.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
              >
                Khong
              </button>
              <button
                onClick={confirmCancel}
                disabled={mutating}
                className="flex-1 py-2.5 bg-crimson-500 text-white rounded-lg font-medium hover:bg-crimson-600 transition-colors disabled:opacity-50"
              >
                {mutating ? "Dang huy..." : "Xac nhan huy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   HISTORY TAB — Lịch sử đơn hàng (session đã đóng)
   ================================================================ */
const datePresets = [
  { key: "today", label: "Hom nay" },
  { key: "7d", label: "7 ngay" },
  { key: "30d", label: "30 ngay" },
  { key: "custom", label: "Tuy chon" },
];

const historyFilterTabs = [
  { key: "all", label: "Tat ca" },
  { key: "completed", label: "Hoan thanh" },
  { key: "cancelled", label: "Da huy" },
];

function getDateRange(preset) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (preset === "today") return { from: today, to: today };
  if (preset === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return { from: d.toISOString().split("T")[0], to: today };
  }
  if (preset === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    return { from: d.toISOString().split("T")[0], to: today };
  }
  return { from: "", to: "" };
}

function HistoryTab() {
  const {
    orders,
    pagination,
    summary,
    loading,
    error,
    fetchHistory,
    fetchOrderDetail,
  } = useOrderHistory();

  const [datePreset, setDatePreset] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Build filters and fetch
  const doFetch = useCallback(
    (page = 1) => {
      const filters = { page, limit: 20 };
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      if (datePreset === "custom") {
        if (customFrom) filters.from = customFrom;
        if (customTo) filters.to = customTo;
      } else {
        const range = getDateRange(datePreset);
        filters.from = range.from;
        filters.to = range.to;
      }

      fetchHistory(filters);
    },
    [datePreset, customFrom, customTo, statusFilter, searchQuery, fetchHistory],
  );

  // Fetch on mount and when filters change
  useEffect(() => {
    doFetch(1);
  }, [doFetch]);

  const handleViewDetail = async (order) => {
    setDetailLoading(true);
    try {
      const detail = await fetchOrderDetail(order.id);
      setSelectedOrder(detail);
    } catch {
      // error set inside hook
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Lich su don hang</h1>
          <p className="text-sea-500">Don hang tu cac phien da dong</p>
        </div>
        <button
          onClick={() => doFetch(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sea-200 rounded-lg text-sea-700 hover:bg-sea-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Lam moi
        </button>
      </div>

      {error && (
        <div className="p-3 bg-crimson-50 border border-crimson-200 rounded-lg text-crimson-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-sea-50 border border-sea-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-sea-500" />
            <p className="text-sm text-sea-600">Tong don</p>
          </div>
          <p className="text-2xl font-bold text-sea-700">
            {summary.total_orders}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CircleCheck className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-600">Hoan thanh</p>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {summary.completed_orders}
          </p>
        </div>
        <div className="bg-crimson-50 border border-crimson-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-crimson-500" />
            <p className="text-sm text-crimson-600">Da huy</p>
          </div>
          <p className="text-2xl font-bold text-crimson-700">
            {summary.cancelled_orders}
          </p>
        </div>
        <div className="bg-coral-50 border border-coral-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-coral-500" />
            <p className="text-sm text-coral-600">Doanh thu</p>
          </div>
          <p className="text-2xl font-bold text-coral-700">
            {summary.total_revenue.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100 space-y-4">
        {/* Row 1: Date presets + search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-sea-500" />
            {datePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  datePreset === p.key
                    ? "bg-sea-500 text-white"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 bg-sea-50 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
              <span className="text-sea-400 text-sm">→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-1.5 bg-sea-50 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
            </div>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tim theo ten ban hoac ma don..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            />
          </div>
        </div>

        {/* Row 2: Status filter */}
        <div className="flex items-center gap-2">
          {historyFilterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-sea-500 text-white"
                  : "bg-sea-50 text-sea-600 hover:bg-sea-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-sea-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-sea-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Khong co don hang nao</p>
          <p className="text-sm">Thu thay doi khoang thoi gian hoac bo loc</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sea-50 text-sea-600">
                  <th className="text-left px-4 py-3 font-medium">Ma don</th>
                  <th className="text-left px-4 py-3 font-medium">Ban</th>
                  <th className="text-center px-4 py-3 font-medium">So mon</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Tong tien
                  </th>
                  <th className="text-center px-4 py-3 font-medium">
                    Trang thai
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Tao luc</th>
                  <th className="text-center px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea-100">
                {orders.map((order) => {
                  const cfg =
                    statusConfig[order.status] || statusConfig.completed;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-sea-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sea-700">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sea-700">
                        {order.table_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-sea-600">
                        {order.item_count || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-coral-600">
                        {Number(order.total_price || 0).toLocaleString("vi-VN")}
                        đ
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sea-500 whitespace-nowrap">
                        {formatTime(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="p-1.5 hover:bg-sea-100 rounded-lg transition-colors text-sea-500 hover:text-sea-700"
                          title="Xem chi tiet"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-sea-100">
              <p className="text-sm text-sea-500">
                Trang {pagination.page} / {pagination.totalPages} (
                {pagination.total} don)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => doFetch(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg hover:bg-sea-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-sea-600" />
                </button>
                {/* Show page numbers */}
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => doFetch(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === pagination.page
                            ? "bg-sea-500 text-white"
                            : "text-sea-600 hover:bg-sea-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() => doFetch(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-sea-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-sea-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {(selectedOrder || detailLoading) && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-sea-500 animate-spin" />
              </div>
            ) : (
              selectedOrder && (
                <>
                  <div className="p-6 border-b border-sea-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-sea-800">
                          Chi tiet don hang
                        </h2>
                        <p className="text-sea-500 text-sm">
                          Don #{selectedOrder.id.slice(0, 8)} —{" "}
                          {selectedOrder.table_name || "Chua gan ban"}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 hover:bg-sea-100 rounded-lg"
                      >
                        <XCircle className="w-5 h-5 text-sea-400" />
                      </button>
                    </div>
                    <div className="mt-3">
                      {(() => {
                        const cfg =
                          statusConfig[selectedOrder.status] ||
                          statusConfig.completed;
                        const Icon = cfg.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}
                          >
                            <Icon className="w-4 h-4" />
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between py-2 border-b border-sea-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sea-700">
                                {item.menu_item_name || "Mon an"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-sea-500">
                                <span>x{item.quantity}</span>
                                {item.note && (
                                  <span className="text-gold-600">
                                    • {item.note}
                                  </span>
                                )}
                                {item.status === "cancelled" && (
                                  <span className="text-crimson-500 font-medium">
                                    (Da huy)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="font-medium text-sea-700 whitespace-nowrap">
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString("vi-VN")}
                            đ
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-sea-200">
                      <span className="font-semibold text-sea-800">
                        Tong cong:
                      </span>
                      <span className="text-xl font-bold text-coral-600">
                        {Number(selectedOrder.total_price || 0).toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </span>
                    </div>

                    <div className="text-sm text-sea-500">
                      Tao luc: {formatTime(selectedOrder.created_at)}
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
