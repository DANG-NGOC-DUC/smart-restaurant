// Thống kê món đã phục vụ theo bàn
function TableStatisticsCard({ tables }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
        <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Mã bàn
        </div>

        <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Món đã phục vụ
        </div>
      </div>

      {/* Rows */}
      {tables.map((table) => (
        <div
          key={table.id}
          className="grid grid-cols-2 border-b border-slate-100 last:border-0"
        >
          {/* Bàn */}
          <div className="flex items-start px-4 py-3">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold text-xs tracking-wide">
              {table.name}
            </span>
          </div>

          {/* Món */}
          <div className="px-4 py-3">
            {table.orders.map((item, index) => {
              const quantity =
                typeof item === "object"
                  ? String(item.quantity ?? 0)
                  : item.split(" ")[0];
              const name =
                typeof item === "object"
                  ? item.name
                  : item.substring(quantity.length + 1);

              return (
                <div
                  key={index}
                  className="flex items-start gap-2 mb-1.5 last:mb-0"
                >
                  {/* Badge số lượng */}
                  <span className="text-rose-400 text-xs font-semibold min-w-[14px]">
                    {quantity}
                  </span>

                  {/* Tên món */}
                  <span className="text-slate-600 text-xs leading-5">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableStatisticsCard;
