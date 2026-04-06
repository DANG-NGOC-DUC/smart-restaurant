import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import TableFilterBar from "../../components/staff/TableFilterBar";
import TableCard from "../../components/staff/TableCard";
import { useStaffTables } from "../../hooks/staff/useStaffTables";
import * as staffService from "../../services/staff.service";

function TableMap() {
  const { tables, loading, error, filter, setFilter, fetchTables, stats } =
    useStaffTables();

  const handleRequestBill = async (tableId) => {
    try {
      await staffService.createPaymentRequest(tableId);
      alert("Đã gửi yêu cầu thanh toán cho Thu ngân.");
    } catch (err) {
      alert(err.response?.data?.error || "Gửi yêu cầu thất bại.");
    }
  };

  return (
    <>
      <TableFilterBar
        activeFilter={filter}
        onFilterChange={setFilter}
        stats={stats}
      />

      <div className="p-4">
        {loading && tables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Đang tải danh sách bàn...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertTriangle className="w-8 h-8 mb-3 text-coral-500" />
            <p className="text-sm text-slate-600 mb-3">{error}</p>
            <button
              onClick={fetchTables}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sea-700 bg-sea-50 rounded-lg hover:bg-sea-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && tables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm">Không có bàn nào phù hợp bộ lọc.</p>
          </div>
        )}

        {!loading && tables.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onRequestBill={handleRequestBill}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TableMap;
