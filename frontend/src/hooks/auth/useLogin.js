import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (error) setError(null);
    },
    [error],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.email || !formData.password) {
        setError("Vui lòng nhập đầy đủ thông tin.");
        setLoading(false);
        return;
      }

      try {
        await login({ email: formData.email, password: formData.password });
        navigate("/admin");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.message ||
            "Đăng nhập thất bại. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, login, navigate],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    clearError,
  };
}
