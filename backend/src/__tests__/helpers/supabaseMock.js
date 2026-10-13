/**
 * Mock Supabase client — dùng cho toàn bộ test suite
 * Không gọi Supabase thật, tránh phụ thuộc vào external service.
 */
export const createSupabaseMock = () => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    getUser: vi.fn(),
    refreshSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
});

export const createSupabaseAdminMock = () => ({
  auth: {
    admin: {
      deleteUser: vi.fn(),
      updateUserById: vi.fn(),
    },
  },
});
