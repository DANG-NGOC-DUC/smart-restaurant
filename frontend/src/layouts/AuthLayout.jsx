import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-gray-50"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1546195643-52c87af88318?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="w-full max-w-md p-8 bg-white bg-opacity-95 rounded-xl shadow-xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-gray-800">SeaFood</h1>
          <p className="text-xl font-semibold text-gray-500"> Restaurant </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
