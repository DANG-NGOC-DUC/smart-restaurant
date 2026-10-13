import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../../components/forms/Input.jsx";

// ════════════════════════════════════════════════════════════════════════════════
describe("Component — Input", () => {
  it("render đúng label và input", () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("hiển thị dấu * đỏ khi required=true", () => {
    render(<Input id="email" label="Email" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("KHÔNG hiển thị dấu * khi required=false", () => {
    render(<Input id="email" label="Email" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("hiển thị error message khi có error prop", () => {
    render(<Input id="email" label="Email" error="Email không hợp lệ" />);
    expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("KHÔNG hiển thị helperText nếu có error", () => {
    render(
      <Input
        id="email"
        label="Email"
        error="Lỗi rồi"
        helperText="Nhập đúng định dạng"
      />
    );
    expect(screen.queryByText("Nhập đúng định dạng")).not.toBeInTheDocument();
    expect(screen.getByText("Lỗi rồi")).toBeInTheDocument();
  });

  it("hiển thị helperText khi không có error", () => {
    render(
      <Input id="phone" label="Phone" helperText="Nhập số điện thoại 10 chữ số" />
    );
    expect(screen.getByText("Nhập số điện thoại 10 chữ số")).toBeInTheDocument();
  });

  it("gọi onChange khi người dùng nhập", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Input
        id="name"
        label="Name"
        value=""
        onChange={handleChange}
      />
    );
    await user.type(screen.getByLabelText("Name"), "Duc");
    expect(handleChange).toHaveBeenCalledTimes(3); // 3 ký tự
  });

  it("áp dụng type đúng — password input", () => {
    render(<Input id="pwd" label="Password" type="password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("input có border đỏ khi có error", () => {
    render(<Input id="email" label="Email" error="Lỗi" />);
    const input = screen.getByLabelText("Email");
    expect(input.className).toContain("border-red-500");
  });

  it("input có border xám khi không có error", () => {
    render(<Input id="email" label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input.className).toContain("border-gray-300");
  });

  it("không render label nếu không truyền label prop", () => {
    render(<Input id="nolabel" />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("truyền placeholder đúng vào input", () => {
    render(<Input id="search" label="Tìm kiếm" placeholder="Nhập từ khoá..." />);
    expect(screen.getByPlaceholderText("Nhập từ khoá...")).toBeInTheDocument();
  });
});
