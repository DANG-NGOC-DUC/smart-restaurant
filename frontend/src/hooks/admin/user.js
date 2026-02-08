import { useCallback, useEffect, useState } from "react";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  createUser,
} from "../../services/admin.service";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers(page, pageSize);
      const data = res.data;
      if (data.users && data.pagination) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateUser(userId, data);
      fetchUsers(pagination.page, pagination.pageSize);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createUser(data);
      fetchUsers(1, pagination.pageSize);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    fetchUsers(page, pagination.pageSize);
  };

  return {
    users,
    pagination,
    loading,
    error,
    refetch: () => fetchUsers(pagination.page, pagination.pageSize),
    deleteUser: handleDeleteUser,
    updateUser: handleUpdateUser,
    createUser: handleCreateUser,
    goToPage,
  };
}
