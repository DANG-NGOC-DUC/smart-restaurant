import { describe, it, expect, vi } from "vitest";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";

// Mock bcrypt để test unit nhanh và độc lập
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async (pwd, salt) => `hashed_${pwd}_salt${salt}`),
    compare: vi.fn(async (pwd, hash) => hash === `hashed_${pwd}_salt10`),
  },
}));

describe("Utils — hash.util (Security & Cryptographic Functions)", () => {
  it("[SEC-01] hashPassword phải gọi bcrypt với salt = 10", async () => {
    const hash = await hashPassword("mySecretPassword123");
    expect(hash).toBe("hashed_mySecretPassword123_salt10");
  });

  it("[SEC-02] comparePassword trả về true khi mật khẩu khớp hash", async () => {
    const isMatch = await comparePassword("mySecretPassword123", "hashed_mySecretPassword123_salt10");
    expect(isMatch).toBe(true);
  });

  it("[SEC-03] comparePassword trả về false khi mật khẩu sai", async () => {
    const isMatch = await comparePassword("wrongPassword", "hashed_mySecretPassword123_salt10");
    expect(isMatch).toBe(false);
  });
});
