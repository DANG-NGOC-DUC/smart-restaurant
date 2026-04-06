import { Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/auth";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function ResetPassword() {
  const {
    formData,
    errors,
    error,
    success,
    loading,
    isValidToken,
    handleChange,
    handleSubmit,
    clearError,
  } = useResetPassword();

  if (!isValidToken) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Link không hợp lệ
          </h2>
          <p className="mt-2 text-gray-600">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
          />
        )}

        <div className="text-center space-y-4">
          <Link
            to="/forgot-password"
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Yêu cầu link mới
          </Link>
          <div>
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-gray-600">
          Nhập mật khẩu mới của bạn
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
        />
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Mật khẩu mới"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
          required
          error={errors.password}
          helperText="Mật khẩu phải có ít nhất 6 ký tự"
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />

        <Input
          label="Xác nhận mật khẩu mới"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Nhập lại mật khẩu mới"
          required
          error={errors.confirmPassword}
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
        >
          Đặt lại mật khẩu
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
