"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
} from "lucide-react";

const orders = [
  {
    id: "DH001",
    table: "Ban 5",
    customer: "Nguyen Van A",
    items: [
      { name: "Tom hum nuong bo toi", qty: 2, price: 650000 },
      { name: "Ngheu hap thai", qty: 1, price: 120000 },
    ],
    total: 1420000,
    status: "cooking",
    time: "18:30",
    note: "Khong hanh",
  },
  {
    id: "DH002",
    table: "Ban 12",
    customer: "Tran Thi B",
    items: [
      { name: "Cua hoang de hap bia", qty: 1, price: 850000 },
      { name: "Lau hai san thap cam", qty: 1, price: 550000 },
      { name: "Muc xao sa ot", qty: 2, price: 180000 },
    ],
    total: 1760000,
    status: "served",
    time: "18:15",
    note: "",
  },
  {
    id: "DH003",
    table: "Ban 3",
    customer: "Le Van C",
    items: [{ name: "Ca mu chien xu", qty: 1, price: 420000 }],
    total: 420000,
    status: "pending",
    time: "18:45",
    note: "Them nuoc cham",
  },
  {
    id: "DH004",
    table: "Ban 8",
    customer: "Pham Thi D",
    items: [
      { name: "Hau nuong pho mai", qty: 6, price: 95000 },
      { name: "Goi ca hoi", qty: 1, price: 280000 },
    ],
    total: 850000,
    status: "cooking",
    time: "18:25",
    note: "",
  },
  {
    id: "DH005",
    table: "Ban 1",
    customer: "Hoang Van E",
    items: [{ name: "Tom hum nuong bo toi", qty: 1, price: 650000 }],
    total: 650000,
    status: "completed",
    time: "17:30",
    note: "",
  },
];

const statusConfig = {
  pending: {
    label: "Cho xac nhan",
    color: "bg-gold-100 text-gold-700",
    icon: Clock,
  },
  cooking: {
    label: "Dang nau",
    color: "bg-sea-100 text-sea-700",
    icon: ChefHat,
  },
  served: {
    label: "Da phuc vu",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  completed: {
    label: "Hoan thanh",
    color: "bg-sea-50 text-sea-600",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Da huy",
    color: "bg-crimson-100 text-crimson-700",
    icon: XCircle,
  },
};

const filterOptions = [
  "Tat ca",
  "Cho xac nhan",
  "Dang nau",
  "Da phuc vu",
  "Hoan thanh",
];

function Orders() {
  const [selectedFilter, setSelectedFilter] = useState("Tat ca");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      selectedFilter === "Tat ca" ||
      statusConfig[order.status].label === selectedFilter;
    const matchSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-sea-800">Quan ly Don hang</h1>
        <p className="text-sea-500">Theo doi va xu ly cac don hang</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gold-50 border border-gold-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-gold-600">3</p>
          <p className="text-sm text-gold-700">Cho xac nhan</p>
        </div>
        <div className="bg-sea-50 border border-sea-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-sea-600">8</p>
          <p className="text-sm text-sea-700">Dang nau</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">12</p>
          <p className="text-sm text-green-700">Da phuc vu</p>
        </div>
        <div className="bg-sea-50 border border-sea-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-sea-600">45</p>
          <p className="text-sm text-sea-500">Hoan thanh hom nay</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tim kiem don hang, ban, khach hang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? "bg-sea-500 text-white"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden hover:shadow-card-hover transition-shadow"
            >
              <div className="p-4 border-b border-sea-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sea-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-sea-600">
                        {order.table.replace("Ban ", "")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sea-800">{order.id}</p>
                      <p className="text-sm text-sea-500">{order.table}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig[order.status].label}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-sea-500">Khach hang:</span>
                  <span className="font-medium text-sea-700">
                    {order.customer}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-sea-500">Thoi gian:</span>
                  <span className="font-medium text-sea-700">{order.time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sea-500">So mon:</span>
                  <span className="font-medium text-sea-700">
                    {order.items.length} mon
                  </span>
                </div>

                {order.note && (
                  <div className="mt-3 p-2 bg-gold-50 rounded-lg">
                    <p className="text-sm text-gold-700">
                      Ghi chu: {order.note}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-sea-100 flex items-center justify-between">
                  <p className="text-lg font-bold text-coral-600">
                    {order.total.toLocaleString()} d
                  </p>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sea-600 hover:bg-sea-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiet
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-sea-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-sea-800">
                    Chi tiet don hang
                  </h2>
                  <p className="text-sea-500">
                    {selectedOrder.id} - {selectedOrder.table}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-sea-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-sea-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-sea-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sea-700">{item.name}</p>
                      <p className="text-sm text-sea-500">x{item.qty}</p>
                    </div>
                    <p className="font-medium text-sea-700">
                      {(item.price * item.qty).toLocaleString()} d
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-4 border-t border-sea-200">
                <span className="font-semibold text-sea-800">Tong cong:</span>
                <span className="text-xl font-bold text-coral-600">
                  {selectedOrder.total.toLocaleString()} d
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors">
                  In hoa don
                </button>
                <button className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 transition-colors">
                  Cap nhat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
