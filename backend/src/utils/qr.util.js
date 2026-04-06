import QRCode from "qrcode";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Sinh chuỗi token ngẫu nhiên
 * @param {number} length - Độ dài token (mặc định 8)
 * @returns {string}
 */
export function generateToken(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Tạo QR Code dạng Data URI (base64 PNG) từ qr_token
 * QR chứa URL: https://[domain]/table/[qr_token]
 * @param {string} token - qr_token của bàn
 * @returns {Promise<string>} Data URI base64 của ảnh QR
 */
export async function generateQRCode(token) {
  const url = `${FRONTEND_URL}/table/${token}`;
  const dataUri = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  return dataUri;
}
