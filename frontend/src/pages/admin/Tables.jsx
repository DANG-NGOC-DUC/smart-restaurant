"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Users,
  CheckCircle,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  RefreshCw,
  AlertCircle,
  Download,
  QrCode,
} from "lucide-react";
import { useAdminTables } from "../../hooks/admin/table";
import { TableFormModal } from "../../components/admin/TableFormModal";

const statusConfig = {
  available: {
    label: "Trống",
    color: "bg-green-500",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-600",
    badgeColor: "bg-green-100 text-green-700",
  },
  occupied: {
    label: "Có khách",
    color: "bg-sea-500",
    bgColor: "bg-sea-50 border-sea-200",
    textColor: "text-sea-600",
    badgeColor: "bg-sea-100 text-sea-700",
  },
};

function Tables() {
  const {
    tables,
    stats,
    loading,
    mutating,
    error,
    refetch,
    createTable,
    updateTable,
    deleteTable,
    openSession,
    closeSession,
  } = useAdminTables();

  const [selectedTable, setSelectedTable] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingTable, setEditingTable] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Memoize filtered lists
  const filteredTables = useMemo(
    () =>
      filterStatus === "all"
        ? tables
        : tables.filter((t) => t.status === filterStatus),
    [tables, filterStatus],
  );

  const activeTables = useMemo(
    () => filteredTables.filter((t) => t.is_active),
    [filteredTables],
  );
  const inactiveTables = useMemo(
    () => filteredTables.filter((t) => !t.is_active),
    [filteredTables],
  );

  const handleCreate = () => {
    setFormMode("create");
    setEditingTable(null);
    setFormOpen(true);
  };

  const handleEdit = (table) => {
    setFormMode("edit");
    setEditingTable(table);
    setFormOpen(true);
    setSelectedTable(null);
  };

  const handleFormSubmit = async (data) => {
    if (formMode === "create") {
      await createTable(data);
    } else {
      await updateTable(editingTable.id, data);
    }
  };

  const handleDelete = async (table) => {
    if (!confirm(`Bạn có chắc muốn xóa bàn "${table.name || table.code}"?`))
      return;
    setActionLoading(table.id);
    try {
      await deleteTable(table.id);
      setSelectedTable(null);
    } catch {
      // error đã xử lý trong hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenSession = async (table) => {
    setActionLoading(table.id);
    try {
      await openSession(table.id);
      setSelectedTable(null);
    } catch {
      // error đã xử lý trong hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseSession = async (table) => {
    if (!confirm(`Đóng phiên bàn "${table.name || table.code}"?`)) return;
    setActionLoading(table.id);
    try {
      await closeSession(table.id);
      setSelectedTable(null);
    } catch (err) {
      if (err.message === "UNSERVED_ITEMS") {
        const items = err.unservedItems || [];
        const statusLabel = {
          pending: "Chờ duyệt",
          processing: "Đang chế biến",
          confirmed: "Đã duyệt",
          ready: "Sẵn sàng",
        };
        const lines = items.map(
          (i) =>
            `  • ${i.name} x${i.quantity} (${statusLabel[i.status] || i.status})`,
        );
        const msg = `Còn ${items.length} món chưa phục vụ:\n${lines.join("\n")}\n\nVẫn đóng phiên? Các món sẽ bị HỦY.`;
        if (confirm(msg)) {
          try {
            await closeSession(table.id, { force: true });
            setSelectedTable(null);
          } catch {
            // error đã xử lý trong hook
          }
        }
      }
      // other errors đã xử lý trong hook
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = useCallback((dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleDownloadQR = useCallback((table) => {
    if (!table.qr_data_uri) return;
    const link = document.createElement("a");
    link.href = table.qr_data_uri;
    link.download = `QR-${table.name || table.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Quản lý Bàn</h1>
          <p className="text-sea-500">
            Sơ đồ và tình trạng các bàn trong nhà hàng
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading || mutating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-50 text-sea-600 rounded-lg hover:bg-sea-100 transition-colors font-medium border border-sea-200"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading || mutating ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm bàn mới
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-sea-50 border border-sea-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sea-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-sea-600">{stats.total}</p>
            <p className="text-sm text-sea-700">Tổng số bàn</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stats.available}
            </p>
            <p className="text-sm text-green-700">Bàn trống</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">
              {stats.occupied}
            </p>
            <p className="text-sm text-amber-700">Có khách</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex items-center gap-2">
          {[
            { key: "all", label: `Tất cả (${tables.length})` },
            { key: "available", label: `Trống (${stats.available})` },
            { key: "occupied", label: `Có khách (${stats.occupied})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === tab.key
                  ? "bg-sea-500 text-white"
                  : "bg-sea-50 text-sea-600 hover:bg-sea-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && tables.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-sea-500" />
          <span className="ml-3 text-sea-500">Đang tải dữ liệu bàn...</span>
        </div>
      )}

      {/* Active Tables grid */}
      {activeTables.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {activeTables.map((table) => {
            const config = statusConfig[table.status] || statusConfig.available;
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-card-hover ${config.bgColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sea-800 truncate">
                    {table.name || table.code}
                  </span>
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${config.color}`}
                  ></span>
                </div>
                <p className="text-xs text-sea-400 mb-2">Mã: {table.code}</p>
                {table.qr_data_uri && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={table.qr_data_uri}
                      alt={`QR ${table.name || table.code}`}
                      className="w-16 h-16 rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-sea-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span>{table.capacity} chỗ</span>
                </div>
                {table.status === "occupied" && table.session_started_at && (
                  <p className="text-sm text-sea-600 font-medium">
                    Từ {formatTime(table.session_started_at)}
                  </p>
                )}
                {table.status === "available" && (
                  <p className="text-sm text-green-600 font-medium">Sẵn sàng</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Inactive tables */}
      {inactiveTables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-sea-600 mb-3">
            Bàn ngưng hoạt động ({inactiveTables.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {inactiveTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-left transition-all hover:shadow-card-hover opacity-60"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-500 truncate">
                    {table.name || table.code}
                  </span>
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Mã: {table.code}</p>
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span>{table.capacity} chỗ</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Ngưng hoạt động
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && tables.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto text-sea-200 mb-4" />
          <h3 className="text-lg font-semibold text-sea-600 mb-2">
            Chưa có bàn nào
          </h3>
          <p className="text-sea-400 mb-4">
            Bắt đầu bằng cách thêm bàn mới cho nhà hàng.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm bàn mới
          </button>
        </div>
      )}

      {/* Table detail modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-sea-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      !selectedTable.is_active
                        ? "bg-gray-400"
                        : (
                            statusConfig[selectedTable.status] ||
                            statusConfig.available
                          ).color
                    }`}
                  >
                    <span className="text-white font-bold text-sm">
                      {selectedTable.code}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sea-800">
                      {selectedTable.name || `Bàn ${selectedTable.code}`}
                    </h2>
                    <p className="text-sea-500">
                      {selectedTable.capacity} chỗ ngồi
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !selectedTable.is_active
                      ? "bg-gray-100 text-gray-600"
                      : (
                          statusConfig[selectedTable.status] ||
                          statusConfig.available
                        ).badgeColor
                  }`}
                >
                  {!selectedTable.is_active
                    ? "Ngưng HĐ"
                    : (
                        statusConfig[selectedTable.status] ||
                        statusConfig.available
                      ).label}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* QR Code */}
              {selectedTable.qr_data_uri && (
                <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={selectedTable.qr_data_uri}
                    alt={`QR ${selectedTable.name || selectedTable.code}`}
                    className="w-40 h-40 rounded-lg mb-3"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadQR(selectedTable);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sea-500 text-white rounded-lg text-sm font-medium hover:bg-sea-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Tải QR xuống
                  </button>
                </div>
              )}

              {/* Thông tin chi tiết */}
              <div className="space-y-3 mb-6">
                {selectedTable.name && (
                  <div className="flex justify-between">
                    <span className="text-sea-500">Tên bàn:</span>
                    <span className="font-medium">{selectedTable.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sea-500">Mã bàn:</span>
                  <span className="font-medium">{selectedTable.code}</span>
                </div>
                {selectedTable.qr_token && (
                  <div className="flex justify-between">
                    <span className="text-sea-500">QR Token:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                      {selectedTable.qr_token}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sea-500">Sức chứa:</span>
                  <span className="font-medium">
                    {selectedTable.capacity} người
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sea-500">Trạng thái:</span>
                  <span className="font-medium">
                    {selectedTable.is_active
                      ? "Đang hoạt động"
                      : "Ngưng hoạt động"}
                  </span>
                </div>
                {selectedTable.status === "occupied" &&
                  selectedTable.session_started_at && (
                    <div className="flex justify-between">
                      <span className="text-sea-500">Phiên bắt đầu:</span>
                      <span className="font-medium">
                        {formatTime(selectedTable.session_started_at)}
                      </span>
                    </div>
                  )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {/* Row 1: Session actions */}
                {selectedTable.is_active && (
                  <div className="flex gap-2">
                    {selectedTable.status === "available" && (
                      <button
                        onClick={() => handleOpenSession(selectedTable)}
                        disabled={actionLoading === selectedTable.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 disabled:opacity-50 transition-colors"
                      >
                        <Power className="w-4 h-4" />
                        Mở phiên
                      </button>
                    )}
                    {selectedTable.status === "occupied" && (
                      <button
                        onClick={() => handleCloseSession(selectedTable)}
                        disabled={actionLoading === selectedTable.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                      >
                        <PowerOff className="w-4 h-4" />
                        Đóng phiên
                      </button>
                    )}
                  </div>
                )}

                {/* Row 2: Edit / Delete / Close */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(selectedTable)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(selectedTable)}
                    disabled={actionLoading === selectedTable.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit form modal */}
      <TableFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        table={editingTable}
        mode={formMode}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

export default Tables;
