import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getDefaultRoute = (role) => {
  if (role === "admin") return "/admin";
  if (role === "staff" || role === "chef") return "/staff";
  return "/";
};

const hasAnyPermission = (permissions, keys) => {
  if (!Array.isArray(keys) || keys.length === 0) return true;
  return keys.some((key) => permissions.has(key));
};

const hasPermissionPrefix = (permissions, prefix) => {
  if (!prefix) return true;
  for (const permission of permissions) {
    if (String(permission).startsWith(prefix)) return true;
  }
  return false;
};

export default function ProtectedRoute({
  children,
  allowRoles,
  requireAnyPermissions,
  requirePermissionPrefix,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role =
    user?.role || user?.db_role || user?.user_metadata?.role || "guest";
  const isAdmin = role === "admin";
  const permissionSet = new Set(user?.permissions || []);

  const roleAllowed =
    !Array.isArray(allowRoles) || allowRoles.length === 0
      ? true
      : allowRoles.includes(role);

  const permissionAllowed =
    isAdmin ||
    (hasAnyPermission(permissionSet, requireAnyPermissions) &&
      hasPermissionPrefix(permissionSet, requirePermissionPrefix));

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
}
