import multer from "multer";
import path from "path";
import { supabaseAdmin } from "../config/supabase.js";

// Cấu hình multer – lưu tạm trong memory (không ghi đĩa)
const storage = multer.memoryStorage();

// Chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, png, webp)."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const BUCKET = "menu-images";

// Tự động tạo bucket nếu chưa tồn tại
let bucketReady = false;
const ensureBucket = async () => {
  if (bucketReady) return;
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error && !error.message.includes("already exists")) {
      throw new Error(`Không thể tạo bucket: ${error.message}`);
    }
  }
  bucketReady = true;
};

/**
 * Upload ảnh lên Supabase Storage
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} originalName - Tên file gốc
 * @param {string} mimetype - MIME type
 * @returns {string} Public URL của ảnh
 */
export const uploadImageToSupabase = async (
  fileBuffer,
  originalName,
  mimetype,
) => {
  const ext = path.extname(originalName);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = `menu-items/${fileName}`;

  // Đảm bảo bucket tồn tại
  await ensureBucket();

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload ảnh thất bại: ${error.message}`);
  }

  // Lấy public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Xóa ảnh khỏi Supabase Storage
 * @param {string} imageUrl - Public URL của ảnh
 */
export const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Trích xuất path từ URL: .../menu-images/menu-items/xxx.jpg → menu-items/xxx.jpg
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`${BUCKET}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
  } catch {
    // Bỏ qua lỗi xóa ảnh (không ảnh hưởng logic chính)
    console.warn("Không thể xóa ảnh cũ:", imageUrl);
  }
};
