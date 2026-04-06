const FILTERS = [
  { key: "all", label: "Tất cả", color: null, statKey: "total" },
  {
    key: "occupied",
    label: "Đang dùng",
    color: "bg-coral-500",
    statKey: "occupied",
  },
  { key: "empty", label: "Trống", color: "bg-sea-400", statKey: "empty" },
];

function TableFilterBar({ activeFilter, onFilterChange, stats }) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-40 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-4 py-3 min-w-max">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          const count = stats[f.statKey] ?? 0;

          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium ${
                isActive
                  ? "bg-sea-800 text-white shadow-sm ring-1 ring-sea-800"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.color && (
                <span className={`h-2 w-2 rounded-full ${f.color}`} />
              )}
              <span>
                {f.label} ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TableFilterBar;
