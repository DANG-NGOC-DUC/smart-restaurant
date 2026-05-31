import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

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
import IngredientsPage from "../pages/admin/Ingredients";
import ReviewsPage from "../pages/admin/Reviews";
import StaffLayout from "../layouts/StaffLayout";
import StaffTableMap from "../pages/staff/TableMap";
import StaffServeFood from "../pages/staff/ServeFood";
import StaffAlerts from "../pages/staff/Alerts";
import StaffOrderPage from "../pages/staff/StaffOrderPage";
import StaffPendingOrders from "../pages/staff/PendingOrders";
import StaffTableDetail from "../pages/staff/TableDetail";
import CashierPage from "../pages/cashier/CashierPage";
import PublicLayout from "../layouts/PublicLayout";
import PublicMenu from "../pages/public/Menu";
import PublicCart from "../pages/public/Cart";
import PublicOrderStatus from "../pages/public/OrderStatus";
import PublicSessionStatus from "../pages/public/SessionStatus";
import PublicReview from "../pages/public/Review";
import ScanTable from "../pages/public/ScanTable";
import GoogleCallback from "../pages/auth/GoogleCallback";
import CustomerLogin from "../pages/public/CustomerLogin";
import Reservation from "../pages/public/Reservation";
import MyReservations from "../pages/public/MyReservations";
import ChefLayout from "../layouts/ChefLayout";
import ChefDashboard from "../pages/chef/ChefDashboard";
import ChefStatistics from "../pages/chef/ChefStatistics";
import ChefInventory from "../pages/chef/ChefInventory";

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

      {/* Google OAuth callback */}
      <Route path="/auth/callback" element={<GoogleCallback />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Staff routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowRoles={["staff", "chef", "admin"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffTableMap />} />
        <Route path="pending" element={<StaffPendingOrders />} />
        <Route path="serve" element={<StaffServeFood />} />
        <Route path="alerts" element={<StaffAlerts />} />
        <Route path="table/:tableId" element={<StaffTableDetail />} />
        <Route path="order/:tableId" element={<StaffOrderPage />} />
      </Route>

      {/* Chef routes */}
      <Route path="/chef" element={<ChefLayout />}>
        <Route index element={<ChefDashboard />} />

        <Route path="statistics" element={<ChefStatistics />} />

        <Route path="inventory" element={<ChefInventory />} />
      </Route>

      {/* Cashier POS - standalone full-screen */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute
            allowRoles={["staff", "chef", "admin"]}
            requirePermissionPrefix="cashier."
          >
            <CashierPage />
          </ProtectedRoute>
        }
      />

      {/* Public routes - customer facing */}
      <Route path="/table/:token" element={<PublicLayout />}>
        <Route index element={<ScanTable />} />
      </Route>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<PublicMenu />} />
        <Route path="menu" element={<PublicMenu />} />
        <Route path="cart" element={<PublicCart />} />
        <Route path="order-status" element={<PublicSessionStatus />} />
        <Route path="order/:orderId" element={<PublicOrderStatus />} />
        <Route path="review/:orderId" element={<PublicReview />} />
        <Route path="account" element={<CustomerLogin />} />
        <Route path="reservation" element={<Reservation />} />
        <Route path="my-reservations" element={<MyReservations />} />
      </Route>
    </Routes>
  );
}
