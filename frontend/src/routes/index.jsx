import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/admin/Dashboard";
import MenuPage from "../pages/admin/Menu";
import OrdersPage from "../pages/admin/Orders";
import TablesPage from "../pages/admin/Tables";
import UsersPage from "../pages/admin/Users";
import ReportPage from "../pages/admin/Report";
import SettingsPage from "../pages/admin/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
