"use client";

import { useState } from "react";
import { Store, Bell, Shield, Palette, CreditCard, Save } from "lucide-react";

const tabs = [
  { id: "general", label: "Chung", icon: Store },
  { id: "notifications", label: "Thong bao", icon: Bell },
  { id: "security", label: "Bao mat", icon: Shield },
  { id: "appearance", label: "Giao dien", icon: Palette },
  { id: "payment", label: "Thanh toan", icon: CreditCard },
];

function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    restaurantName: "Seafood Restaurant",
    address: "123 Duong Hai San, Quan 1, TP.HCM",
    phone: "028 1234 5678",
    email: "contact@seafood.vn",
    openTime: "10:00",
    closeTime: "22:00",
    taxRate: 10,
    serviceCharge: 5,
    emailNotif: true,
    orderNotif: true,
    reportNotif: false,
    twoFactor: false,
    sessionTimeout: 30,
    theme: "light",
    language: "vi",
    cashPayment: true,
    cardPayment: true,
    momoPayment: true,
    vnpayPayment: false,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-sea-800">Cai dat</h1>
        <p className="text-sea-500">Quan ly cac thiet lap he thong</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-card border border-sea-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-sea-50 text-sea-700"
                    : "text-sea-600 hover:bg-sea-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-card border border-sea-100 p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-sea-800">
                  Thong tin nha hang
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Ten nha hang
                    </label>
                    <input
                      type="text"
                      value={settings.restaurantName}
                      onChange={(e) =>
                        handleChange("restaurantName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      So dien thoai
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Dia chi
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                </div>

                <h3 className="text-md font-semibold text-sea-800 pt-4">
                  Gio hoat dong
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Gio mo cua
                    </label>
                    <input
                      type="time"
                      value={settings.openTime}
                      onChange={(e) => handleChange("openTime", e.target.value)}
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Gio dong cua
                    </label>
                    <input
                      type="time"
                      value={settings.closeTime}
                      onChange={(e) =>
                        handleChange("closeTime", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                </div>

                <h3 className="text-md font-semibold text-sea-800 pt-4">
                  Thue va phi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Thue VAT (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleChange("taxRate", e.target.value)}
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sea-700 mb-1">
                      Phi dich vu (%)
                    </label>
                    <input
                      type="number"
                      value={settings.serviceCharge}
                      onChange={(e) =>
                        handleChange("serviceCharge", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-sea-800">
                  Cai dat thong bao
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sea-700">
                        Thong bao qua email
                      </p>
                      <p className="text-sm text-sea-500">
                        Nhan thong bao quan trong qua email
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("emailNotif", !settings.emailNotif)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotif ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.emailNotif ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sea-700">
                        Thong bao don hang moi
                      </p>
                      <p className="text-sm text-sea-500">
                        Nhan thong bao khi co don hang moi
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("orderNotif", !settings.orderNotif)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.orderNotif ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.orderNotif ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sea-700">
                        Bao cao hang ngay
                      </p>
                      <p className="text-sm text-sea-500">
                        Nhan bao cao doanh thu hang ngay
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("reportNotif", !settings.reportNotif)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.reportNotif ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.reportNotif ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-sea-800">
                  Cai dat bao mat
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sea-700">
                        Xac thuc 2 yeu to
                      </p>
                      <p className="text-sm text-sea-500">
                        Tang cuong bao mat tai khoan
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("twoFactor", !settings.twoFactor)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactor ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.twoFactor ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="p-4 bg-sea-50 rounded-lg">
                    <label className="block font-medium text-sea-700 mb-2">
                      Thoi gian het phien (phut)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        handleChange("sessionTimeout", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                    />
                    <p className="text-sm text-sea-500 mt-1">
                      Tu dong dang xuat sau thoi gian khong hoat dong
                    </p>
                  </div>

                  <button className="w-full py-3 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors">
                    Doi mat khau
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-sea-800">
                  Cai dat giao dien
                </h2>

                <div>
                  <label className="block font-medium text-sea-700 mb-3">
                    Che do hien thi
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleChange("theme", "light")}
                      className={`p-4 border-2 rounded-xl text-center transition-colors ${
                        settings.theme === "light"
                          ? "border-sea-500 bg-sea-50"
                          : "border-sea-200"
                      }`}
                    >
                      <div className="w-12 h-12 bg-white border border-sea-200 rounded-lg mx-auto mb-2"></div>
                      <p className="font-medium text-sea-700">Sang</p>
                    </button>
                    <button
                      onClick={() => handleChange("theme", "dark")}
                      className={`p-4 border-2 rounded-xl text-center transition-colors ${
                        settings.theme === "dark"
                          ? "border-sea-500 bg-sea-50"
                          : "border-sea-200"
                      }`}
                    >
                      <div className="w-12 h-12 bg-sea-800 rounded-lg mx-auto mb-2"></div>
                      <p className="font-medium text-sea-700">Toi</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-sea-700 mb-2">
                    Ngon ngu
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full px-4 py-2 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500"
                  >
                    <option value="vi">Tieng Viet</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-sea-800">
                  Phuong thuc thanh toan
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">$</span>
                      </div>
                      <div>
                        <p className="font-medium text-sea-700">Tien mat</p>
                        <p className="text-sm text-sea-500">
                          Thanh toan truc tiep
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("cashPayment", !settings.cashPayment)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.cashPayment ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.cashPayment ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sea-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-sea-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sea-700">
                          The ngan hang
                        </p>
                        <p className="text-sm text-sea-500">
                          Visa, Mastercard, JCB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("cardPayment", !settings.cardPayment)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.cardPayment ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.cardPayment ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
                        <span className="text-coral-600 font-bold text-sm">
                          M
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sea-700">MoMo</p>
                        <p className="text-sm text-sea-500">Vi dien tu MoMo</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("momoPayment", !settings.momoPayment)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.momoPayment ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.momoPayment ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-sea-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-crimson-100 rounded-lg flex items-center justify-center">
                        <span className="text-crimson-600 font-bold text-xs">
                          VNP
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sea-700">VNPay</p>
                        <p className="text-sm text-sea-500">
                          Cong thanh toan VNPay
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleChange("vnpayPayment", !settings.vnpayPayment)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${settings.vnpayPayment ? "bg-sea-500" : "bg-sea-300"}`}
                    >
                      <span
                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.vnpayPayment ? "translate-x-6" : "translate-x-0.5"}`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="mt-8 pt-6 border-t border-sea-100 flex justify-end">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium">
                <Save className="w-5 h-5" />
                Luu thay doi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
