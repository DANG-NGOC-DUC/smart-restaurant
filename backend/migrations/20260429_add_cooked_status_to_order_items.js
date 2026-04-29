/**
 * Migration: Thêm trạng thái "cooked" cho order_items
 *
 * Luồng trạng thái mới:
 *  pending → preparing → cooked → served → (hoàn thành)
 *
 * - pending: Chờ (khi khách đặt qua QR)
 * - preparing: Đang chế biến (bếp nhận)
 * - cooked: Đã chế biến (bếp xác nhận xong)
 * - served: Đã hoàn thành (nhân viên bê lên xác nhận)
 * - cancelled: Đã hủy
 */

export const up = async (knex) => {
  // Không cần thay đổi database schema
  // Chỉ cần cập nhật logic application
  // Status đã là string nên có thể thêm "cooked" mà không cần migration
  console.log(
    "✓ Status 'cooked' sẽ được sử dụng từ nay. Không cần thay đổi schema."
  );
};

export const down = async (knex) => {
  // Rollback: không cần làm gì
  console.log("✓ Rollback: 'cooked' status removed");
};
