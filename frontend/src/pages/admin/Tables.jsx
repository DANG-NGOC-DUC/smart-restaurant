"use client";

import { useState } from "react";
import { Plus, Users, Clock, CheckCircle } from "lucide-react";

const floors = ["Tang 1", "Tang 2", "San thuong"];

const tablesData = {
  "Tang 1": [
    {
      id: 1,
      name: "Ban 1",
      seats: 4,
      status: "occupied",
      guests: 3,
      time: "18:30",
      order: "DH001",
    },
    { id: 2, name: "Ban 2", seats: 4, status: "available", guests: 0 },
    {
      id: 3,
      name: "Ban 3",
      seats: 6,
      status: "occupied",
      guests: 5,
      time: "18:15",
      order: "DH002",
    },
    {
      id: 4,
      name: "Ban 4",
      seats: 4,
      status: "reserved",
      guests: 0,
      reserveTime: "19:00",
      reserveName: "Nguyen Van A",
    },
    { id: 5, name: "Ban 5", seats: 8, status: "available", guests: 0 },
    {
      id: 6,
      name: "Ban 6",
      seats: 4,
      status: "occupied",
      guests: 4,
      time: "17:45",
      order: "DH003",
    },
  ],
  "Tang 2": [
    { id: 7, name: "Ban 7", seats: 6, status: "available", guests: 0 },
    {
      id: 8,
      name: "Ban 8",
      seats: 6,
      status: "occupied",
      guests: 6,
      time: "18:00",
      order: "DH004",
    },
    {
      id: 9,
      name: "Ban 9",
      seats: 8,
      status: "reserved",
      guests: 0,
      reserveTime: "19:30",
      reserveName: "Tran Thi B",
    },
    { id: 10, name: "Ban 10", seats: 4, status: "available", guests: 0 },
    { id: 11, name: "Ban 11", seats: 10, status: "available", guests: 0 },
    {
      id: 12,
      name: "Ban 12",
      seats: 6,
      status: "occupied",
      guests: 4,
      time: "18:20",
      order: "DH005",
    },
  ],
  "San thuong": [
    {
      id: 13,
      name: "Ban VIP 1",
      seats: 12,
      status: "reserved",
      guests: 0,
      reserveTime: "19:00",
      reserveName: "Cong ty ABC",
    },
    { id: 14, name: "Ban VIP 2", seats: 12, status: "available", guests: 0 },
    {
      id: 15,
      name: "Ban VIP 3",
      seats: 20,
      status: "occupied",
      guests: 15,
      time: "17:30",
      order: "DH006",
    },
  ],
};

const statusConfig = {
  available: {
    label: "Trong",
    color: "bg-green-500",
    bgColor: "bg-green-50 border-green-200",
  },
  occupied: {
    label: "Co khach",
    color: "bg-sea-500",
    bgColor: "bg-sea-50 border-sea-200",
  },
  reserved: {
    label: "Dat truoc",
    color: "bg-gold-500",
    bgColor: "bg-gold-50 border-gold-200",
  },
};

function Tables() {
  const [selectedFloor, setSelectedFloor] = useState("Tang 1");
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = tablesData[selectedFloor];

  const stats = {
    available: Object.values(tablesData)
      .flat()
      .filter((t) => t.status === "available").length,
    occupied: Object.values(tablesData)
      .flat()
      .filter((t) => t.status === "occupied").length,
    reserved: Object.values(tablesData)
      .flat()
      .filter((t) => t.status === "reserved").length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Quan ly Ban</h1>
          <p className="text-sea-500">
            So do va tinh trang cac ban trong nha hang
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Them ban moi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stats.available}
            </p>
            <p className="text-sm text-green-700">Ban trong</p>
          </div>
        </div>
        <div className="bg-sea-50 border border-sea-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sea-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-sea-600">{stats.occupied}</p>
            <p className="text-sm text-sea-700">Co khach</p>
          </div>
        </div>
        <div className="bg-gold-50 border border-gold-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gold-600">{stats.reserved}</p>
            <p className="text-sm text-gold-700">Dat truoc</p>
          </div>
        </div>
      </div>

      {/* Floor tabs */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex items-center gap-2">
          {floors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFloor === floor
                  ? "bg-sea-500 text-white"
                  : "bg-sea-50 text-sea-600 hover:bg-sea-100"
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-card-hover ${statusConfig[table.status].bgColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sea-800">{table.name}</span>
              <span
                className={`w-3 h-3 rounded-full ${statusConfig[table.status].color}`}
              ></span>
            </div>
            <div className="flex items-center gap-1 text-sm text-sea-500 mb-1">
              <Users className="w-4 h-4" />
              <span>{table.seats} cho</span>
            </div>
            {table.status === "occupied" && (
              <p className="text-sm text-sea-600 font-medium">
                {table.guests} khach - {table.time}
              </p>
            )}
            {table.status === "reserved" && (
              <p className="text-sm text-gold-600 font-medium">
                {table.reserveTime}
              </p>
            )}
            {table.status === "available" && (
              <p className="text-sm text-green-600 font-medium">San sang</p>
            )}
          </button>
        ))}
      </div>

      {/* Table detail modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-sea-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig[selectedTable.status].color}`}
                  >
                    <span className="text-white font-bold">
                      {selectedTable.name
                        .replace("Ban ", "")
                        .replace("VIP ", "V")}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-sea-800">
                      {selectedTable.name}
                    </h2>
                    <p className="text-sea-500">
                      {selectedTable.seats} cho ngoi
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTable.status === "available"
                      ? "bg-green-100 text-green-700"
                      : selectedTable.status === "occupied"
                        ? "bg-sea-100 text-sea-700"
                        : "bg-gold-100 text-gold-700"
                  }`}
                >
                  {statusConfig[selectedTable.status].label}
                </span>
              </div>
            </div>

            <div className="p-6">
              {selectedTable.status === "occupied" && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sea-500">So khach:</span>
                    <span className="font-medium">
                      {selectedTable.guests} nguoi
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sea-500">Gio vao:</span>
                    <span className="font-medium">{selectedTable.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sea-500">Ma don:</span>
                    <span className="font-medium text-sea-600">
                      {selectedTable.order}
                    </span>
                  </div>
                </div>
              )}

              {selectedTable.status === "reserved" && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sea-500">Gio dat:</span>
                    <span className="font-medium">
                      {selectedTable.reserveTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sea-500">Nguoi dat:</span>
                    <span className="font-medium">
                      {selectedTable.reserveName}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTable(null)}
                  className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200"
                >
                  Dong
                </button>
                {selectedTable.status === "available" && (
                  <button className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600">
                    Tao don
                  </button>
                )}
                {selectedTable.status === "occupied" && (
                  <button className="flex-1 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
                    Thanh toan
                  </button>
                )}
                {selectedTable.status === "reserved" && (
                  <button className="flex-1 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600">
                    Check-in
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tables;
