import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../components/ui/Button.jsx";

describe("UI Component — Button (Unit Testing & User Event Simulation)", () => {
  it("[UI-01] Render đúng nội dung children", () => {
    render(<Button>Xác nhận đặt bàn</Button>);
    expect(screen.getByRole("button", { name: "Xác nhận đặt bàn" })).toBeInTheDocument();
  });

  it("[UI-02] Type mặc định là 'button'", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("[UI-03] Cho phép tùy biến type='submit'", () => {
    render(<Button type="submit">Gửi đơn</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("[UI-04] Kích hoạt sự kiện onClick khi người dùng bấm nút", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Bấm vào đây</Button>);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("[UI-05] Không kích hoạt onClick khi disabled = true", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Nút vô hiệu</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("[UI-06] Khi loading = true: hiển thị text Loading... và bị vô hiệu hóa", () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Nút đang tải</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Nút đang tải")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("[UI-07] Áp dụng đúng class khi chọn variant='danger'", () => {
    render(<Button variant="danger">Hủy món</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-600");
  });

  it("[UI-08] Áp dụng đúng class khi chọn variant='outline'", () => {
    render(<Button variant="outline">Xem chi tiết</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-2 border-blue-600");
  });

  it("[UI-09] Áp dụng đúng padding theo size ('sm', 'lg')", () => {
    const { rerender } = render(<Button size="sm">Nhỏ</Button>);
    expect(screen.getByRole("button").className).toContain("px-3 py-1.5");

    rerender(<Button size="lg">Lớn</Button>);
    expect(screen.getByRole("button").className).toContain("px-8 py-3");
  });

  it("[UI-10] Áp dụng class 'w-full' khi fullWidth = true", () => {
    render(<Button fullWidth>Nút tràn viền</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
