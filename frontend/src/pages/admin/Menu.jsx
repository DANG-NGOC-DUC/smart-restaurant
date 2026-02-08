"use client";

import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Filter } from "lucide-react";

const categories = [
  "Tat ca",
  "Hai san tuoi song",
  "Mon nuong",
  "Mon hap",
  "Mon xao",
  "Lau",
  "Mon khai vi",
];

const menuItems = [
  {
    id: 1,
    name: "Tom hum nuong bo toi",
    category: "Mon nuong",
    price: 650000,
    status: "active",
    image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=200",
  },
  {
    id: 2,
    name: "Cua hoang de hap bia",
    category: "Mon hap",
    price: 850000,
    status: "active",
    image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=200",
  },
  {
    id: 3,
    name: "Ca mu chien xu",
    category: "Mon xao",
    price: 420000,
    status: "active",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=200",
  },
  {
    id: 4,
    name: "Muc xao sa ot",
    category: "Mon xao",
    price: 180000,
    status: "active",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200",
  },
  {
    id: 5,
    name: "Ngheu hap thai",
    category: "Mon hap",
    price: 120000,
    status: "active",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=200",
  },
  {
    id: 6,
    name: "Lau hai san thap cam",
    category: "Lau",
    price: 550000,
    status: "active",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200",
  },
  {
    id: 7,
    name: "Goi ca hoi",
    category: "Mon khai vi",
    price: 280000,
    status: "inactive",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200",
  },
  {
    id: 8,
    name: "Hau nuong pho mai",
    category: "Mon nuong",
    price: 95000,
    status: "active",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200",
  },
];

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("Tat ca");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = menuItems.filter((item) => {
    const matchCategory =
      selectedCategory === "Tat ca" || item.category === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Quan ly Menu</h1>
          <p className="text-sea-500">Quan ly cac mon an trong thuc don</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Them mon moi
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tim kiem mon an..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-sea-500 text-white"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden group"
          >
            <div className="relative h-40 bg-sea-100">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.status === "inactive" && (
                <div className="absolute inset-0 bg-sea-900/50 flex items-center justify-center">
                  <span className="text-white font-medium">Het hang</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 bg-white rounded-lg shadow hover:bg-sea-50">
                  <Edit2 className="w-4 h-4 text-sea-600" />
                </button>
                <button className="p-1.5 bg-white rounded-lg shadow hover:bg-crimson-50">
                  <Trash2 className="w-4 h-4 text-crimson-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sea-800">{item.name}</h3>
                  <p className="text-sm text-sea-500">{item.category}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-sea-100 text-sea-500"
                  }`}
                >
                  {item.status === "active" ? "Con hang" : "Het"}
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-coral-600">
                {item.price.toLocaleString()} d
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sea-500">Khong tim thay mon an nao</p>
        </div>
      )}
    </div>
  );
}

export default Menu;
