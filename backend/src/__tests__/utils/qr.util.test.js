import { describe, it, expect, vi } from "vitest";
import { generateToken, generateQRCode } from "../../utils/qr.util.js";

// Mock thư viện qrcode
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(async (url, opts) => `data:image/png;base64,mockQrFor_${url}`),
  },
}));

describe("Utils — qr.util (Boundary Value Analysis & Data Validation)", () => {
  describe("generateToken", () => {
    it("[BVA-04] Sinh token với độ dài mặc định (length = 8)", () => {
      const token = generateToken();
      expect(typeof token).toBe("string");
      expect(token).toHaveLength(8);
      // Chỉ chứa ký tự alphanumeric
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });

    it("[BVA-05] Sinh token với độ dài biên dưới (length = 0)", () => {
      const token = generateToken(0);
      expect(token).toBe("");
    });

    it("[BVA-06] Sinh token với độ dài tùy biến lớn (length = 32)", () => {
      const token = generateToken(32);
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });

    it("[EP-13] Hai lần sinh liên tiếp phải cho ra token ngẫu nhiên khác nhau", () => {
      const token1 = generateToken(16);
      const token2 = generateToken(16);
      expect(token1).not.toBe(token2);
    });
  });

  describe("generateQRCode", () => {
    it("[EP-14] Tạo URL chứa token và trả về định dạng Data URI", async () => {
      const token = "table_abc_123";
      const qrData = await generateQRCode(token);

      expect(typeof qrData).toBe("string");
      expect(qrData).toContain("data:image/png;base64,");
      expect(qrData).toContain(`table/${token}`);
    });
  });
});
