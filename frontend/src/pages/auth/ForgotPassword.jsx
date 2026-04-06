import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hooks/auth";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function ForgotPassword() {
  const {
    email,
    message,
    error,
    loading,
    handleChange,
    handleSubmit,
    clearError,
  } = useForgotPassword();

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Quên mật khẩu?</h2>
        <p className="mt-2 text-gray-600">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={clearError}
        />
      )}

      {message && (
        <Alert
          type="success"
          message={message}
        />
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          required
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
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
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
          Gửi email đặt lại mật khẩu
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
