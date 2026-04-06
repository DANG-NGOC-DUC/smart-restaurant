/**
 * Seed: Món hải sản Việt Nam
 * Bao gồm: danh mục, món ăn, nguyên liệu, công thức (recipe), tồn kho mẫu
 * Chạy: npx knex seed:run --specific=01_seafood_menu.js
 */

// ─── IDs cố định để FK map chính xác ───────────────────────────────────────

// Categories
const C = {
  tom: "c1000000-0000-0000-0000-000000000001",
  cua: "c1000000-0000-0000-0000-000000000002",
  ca: "c1000000-0000-0000-0000-000000000003",
  muc: "c1000000-0000-0000-0000-000000000004",
  hau: "c1000000-0000-0000-0000-000000000005",
  lau: "c1000000-0000-0000-0000-000000000006",
};

// Menu items
const M = {
  // Tôm
  tom_hum_bo_toi: "a1000000-0000-0000-0000-000000000001",
  tom_su_rang_muoi: "a1000000-0000-0000-0000-000000000002",
  tom_the_hap_sa: "a1000000-0000-0000-0000-000000000003",
  tom_bot_chien: "a1000000-0000-0000-0000-000000000004",
  // Cua & Ghẹ
  cua_rang_me: "a1000000-0000-0000-0000-000000000005",
  ghe_hap_bia: "a1000000-0000-0000-0000-000000000006",
  cua_luoc: "a1000000-0000-0000-0000-000000000007",
  // Cá
  ca_loc_nuong: "a1000000-0000-0000-0000-000000000008",
  ca_hong_hap: "a1000000-0000-0000-0000-000000000009",
  ca_dieu_hong_chien: "a1000000-0000-0000-0000-000000000010",
  // Mực & Bạch tuộc
  muc_nuong_sate: "a1000000-0000-0000-0000-000000000011",
  muc_chien_gion: "a1000000-0000-0000-0000-000000000012",
  bach_tuoc_xao_cay: "a1000000-0000-0000-0000-000000000013",
  // Hàu & Sò
  hau_nuong_mo_hanh: "a1000000-0000-0000-0000-000000000014",
  so_diep_pho_mai: "a1000000-0000-0000-0000-000000000015",
  ngheu_hap_sa: "a1000000-0000-0000-0000-000000000016",
  // Lẩu
  lau_thai_chua_cay: "a1000000-0000-0000-0000-000000000017",
  lau_hai_san_dua: "a1000000-0000-0000-0000-000000000018",
};

// Ingredients
const I = {
  tom_hum: "b1000000-0000-0000-0000-000000000001",
  tom_su: "b1000000-0000-0000-0000-000000000002",
  tom_the: "b1000000-0000-0000-0000-000000000003",
  cua_bien: "b1000000-0000-0000-0000-000000000004",
  ghe: "b1000000-0000-0000-0000-000000000005",
  ca_loc: "b1000000-0000-0000-0000-000000000006",
  ca_hong: "b1000000-0000-0000-0000-000000000007",
  ca_dieu_hong: "b1000000-0000-0000-0000-000000000008",
  muc_ong: "b1000000-0000-0000-0000-000000000009",
  bach_tuoc: "b1000000-0000-0000-0000-000000000010",
  hau: "b1000000-0000-0000-0000-000000000011",
  so_diep: "b1000000-0000-0000-0000-000000000012",
  ngheu: "b1000000-0000-0000-0000-000000000013",
  // Gia vị & nguyên liệu phụ
  toi: "b1000000-0000-0000-0000-000000000014",
  hanh_la: "b1000000-0000-0000-0000-000000000015",
  sa: "b1000000-0000-0000-0000-000000000016",
  gung: "b1000000-0000-0000-0000-000000000017",
  ot: "b1000000-0000-0000-0000-000000000018",
  me: "b1000000-0000-0000-0000-000000000019",
  bo: "b1000000-0000-0000-0000-000000000020",
  sate: "b1000000-0000-0000-0000-000000000021",
  pho_mai: "b1000000-0000-0000-0000-000000000022",
  bia: "b1000000-0000-0000-0000-000000000023",
  nuoc_dua: "b1000000-0000-0000-0000-000000000024",
  bot_chien_gion: "b1000000-0000-0000-0000-000000000025",
  nuoc_mam: "b1000000-0000-0000-0000-000000000026",
  duong: "b1000000-0000-0000-0000-000000000027",
  dau_an: "b1000000-0000-0000-0000-000000000028",
  nam_kim_cham: "b1000000-0000-0000-0000-000000000029",
  cai_thao: "b1000000-0000-0000-0000-000000000030",
};

// ─── Seed function ──────────────────────────────────────────────────────────

export const seed = async (knex) => {
  // ── 1. Menu Categories ───────────────────────────────────────────────────
  await knex("menu_categories")
    .insert([
      { id: C.tom, name: "Tôm" },
      { id: C.cua, name: "Cua & Ghẹ" },
      { id: C.ca, name: "Cá" },
      { id: C.muc, name: "Mực & Bạch Tuộc" },
      { id: C.hau, name: "Hàu & Sò" },
      { id: C.lau, name: "Lẩu Hải Sản" },
    ])
    .onConflict("id")
    .ignore();

  // ── 2. Menu Items ────────────────────────────────────────────────────────
  await knex("menu_items")
    .insert([
      // --- Tôm ---
      {
        id: M.tom_hum_bo_toi,
        name: "Tôm Hùm Nướng Bơ Tỏi",
        description:
          "Tôm hùm tươi nướng với bơ thơm, tỏi phi vàng, ăn kèm bánh mì nướng giòn rụm.",
        price: 580000,
        category_id: C.tom,
        is_available: true,
      },
      {
        id: M.tom_su_rang_muoi,
        name: "Tôm Sú Rang Muối",
        description:
          "Tôm sú size lớn rang muối ớt xanh, vỏ giòn tan, thịt ngọt đậm đà.",
        price: 220000,
        category_id: C.tom,
        is_available: true,
      },
      {
        id: M.tom_the_hap_sa,
        name: "Tôm Thẻ Hấp Sả",
        description:
          "Tôm thẻ tươi hấp với sả, gừng, ăn kèm nước chấm muối tiêu chanh.",
        price: 150000,
        category_id: C.tom,
        is_available: true,
      },
      {
        id: M.tom_bot_chien,
        name: "Tôm Lăn Bột Chiên Giòn",
        description:
          "Tôm sú tẩm bột chiên giòn vàng, bên trong mọng nước, chấm sốt mayo tỏi ớt.",
        price: 130000,
        category_id: C.tom,
        is_available: true,
      },
      // --- Cua & Ghẹ ---
      {
        id: M.cua_rang_me,
        name: "Cua Rang Me",
        description:
          "Cua biển rang sốt me chua ngọt đặc trưng, sa tế cay nhẹ, hương vị đậm đà khó quên.",
        price: 320000,
        category_id: C.cua,
        is_available: true,
      },
      {
        id: M.ghe_hap_bia,
        name: "Ghẹ Hấp Bia",
        description:
          "Ghẹ xanh hấp bia tươi cùng sả gừng, thịt ngọt giữ nguyên vị biển tự nhiên.",
        price: 280000,
        category_id: C.cua,
        is_available: true,
      },
      {
        id: M.cua_luoc,
        name: "Cua Biển Luộc",
        description:
          "Cua biển tươi luộc sả gừng, gạch béo ngậy, chấm muối tiêu chanh đơn giản mà đặc biệt.",
        price: 350000,
        category_id: C.cua,
        is_available: true,
      },
      // --- Cá ---
      {
        id: M.ca_loc_nuong,
        name: "Cá Lóc Nướng Trui",
        description:
          "Cá lóc đồng nướng trui nguyên con, cuốn bánh tráng rau sống chấm mắm nêm truyền thống.",
        price: 180000,
        category_id: C.ca,
        is_available: true,
      },
      {
        id: M.ca_hong_hap,
        name: "Cá Hồng Hấp Gừng Hành",
        description:
          "Cá hồng tươi hấp gừng hành, rưới dầu nóng xì dầu thơm lừng kiểu Hoa.",
        price: 250000,
        category_id: C.ca,
        is_available: true,
      },
      {
        id: M.ca_dieu_hong_chien,
        name: "Cá Điêu Hồng Chiên Giòn",
        description:
          "Cá điêu hồng chiên giòn nguyên con, rưới sốt chua ngọt cà chua ớt, ăn kèm cơm trắng.",
        price: 160000,
        category_id: C.ca,
        is_available: true,
      },
      // --- Mực & Bạch Tuộc ---
      {
        id: M.muc_nuong_sate,
        name: "Mực Nướng Sa Tế",
        description:
          "Mực ống tươi ướp sa tế nướng than hồng, vừa thơm vừa cay, chấm tương tỏi ớt.",
        price: 190000,
        category_id: C.muc,
        is_available: true,
      },
      {
        id: M.muc_chien_gion,
        name: "Mực Chiên Giòn",
        description:
          "Mực cắt khoanh tẩm bột chiên giòn vàng ươm, ăn kèm sốt tartar homemade.",
        price: 170000,
        category_id: C.muc,
        is_available: true,
      },
      {
        id: M.bach_tuoc_xao_cay,
        name: "Bạch Tuộc Xào Cay",
        description:
          "Bạch tuộc tươi xào lăn với tỏi, ớt, sa tế đậm đà, thêm hành tây giòn ngọt.",
        price: 200000,
        category_id: C.muc,
        is_available: true,
      },
      // --- Hàu & Sò ---
      {
        id: M.hau_nuong_mo_hanh,
        name: "Hàu Nướng Mỡ Hành",
        description:
          "Hàu Vũng Tàu nướng nóng hổi, chan mỡ hành thơm, thêm đậu phộng rang giòn rụm.",
        price: 160000,
        category_id: C.hau,
        is_available: true,
      },
      {
        id: M.so_diep_pho_mai,
        name: "Sò Điệp Nướng Phô Mai",
        description:
          "Sò điệp tươi nướng phủ phô mai tan chảy, thêm tỏi phi bơ thơm ngậy hấp dẫn.",
        price: 200000,
        category_id: C.hau,
        is_available: true,
      },
      {
        id: M.ngheu_hap_sa,
        name: "Nghêu Hấp Sả",
        description:
          "Nghêu biển tươi hấp sả gừng, nước hấp ngọt thanh, ăn kèm bánh mì chấm nước mắm gừng.",
        price: 120000,
        category_id: C.hau,
        is_available: true,
      },
      // --- Lẩu Hải Sản ---
      {
        id: M.lau_thai_chua_cay,
        name: "Lẩu Hải Sản Thái Chua Cay",
        description:
          "Lẩu tom yum hải sản với tôm, mực, nghêu, nấm kim châm, chua cay đặc trưng phong cách Thái.",
        price: 350000,
        category_id: C.lau,
        is_available: true,
      },
      {
        id: M.lau_hai_san_dua,
        name: "Lẩu Hải Sản Dừa",
        description:
          "Lẩu nước dừa thanh ngọt với tôm, cua, mực, bạch tuộc, rau cải thảo và nấm tươi.",
        price: 320000,
        category_id: C.lau,
        is_available: true,
      },
    ])
    .onConflict("id")
    .ignore();

  // ── 3. Ingredients ───────────────────────────────────────────────────────
  await knex("ingredients")
    .insert([
      // Hải sản chính
      { id: I.tom_hum, name: "Tôm hùm", unit: "con" },
      { id: I.tom_su, name: "Tôm sú", unit: "kg" },
      { id: I.tom_the, name: "Tôm thẻ", unit: "kg" },
      { id: I.cua_bien, name: "Cua biển", unit: "kg" },
      { id: I.ghe, name: "Ghẹ xanh", unit: "kg" },
      { id: I.ca_loc, name: "Cá lóc", unit: "kg" },
      { id: I.ca_hong, name: "Cá hồng", unit: "kg" },
      { id: I.ca_dieu_hong, name: "Cá điêu hồng", unit: "kg" },
      { id: I.muc_ong, name: "Mực ống", unit: "kg" },
      { id: I.bach_tuoc, name: "Bạch tuộc", unit: "kg" },
      { id: I.hau, name: "Hàu", unit: "con" },
      { id: I.so_diep, name: "Sò điệp", unit: "con" },
      { id: I.ngheu, name: "Nghêu", unit: "kg" },
      // Gia vị & nguyên liệu phụ
      { id: I.toi, name: "Tỏi", unit: "kg" },
      { id: I.hanh_la, name: "Hành lá", unit: "kg" },
      { id: I.sa, name: "Sả", unit: "kg" },
      { id: I.gung, name: "Gừng", unit: "kg" },
      { id: I.ot, name: "Ớt", unit: "kg" },
      { id: I.me, name: "Me", unit: "kg" },
      { id: I.bo, name: "Bơ lạt", unit: "kg" },
      { id: I.sate, name: "Sa tế", unit: "kg" },
      { id: I.pho_mai, name: "Phô mai mozzarella", unit: "kg" },
      { id: I.bia, name: "Bia", unit: "chai" },
      { id: I.nuoc_dua, name: "Nước dừa", unit: "lít" },
      { id: I.bot_chien_gion, name: "Bột chiên giòn", unit: "kg" },
      { id: I.nuoc_mam, name: "Nước mắm", unit: "lít" },
      { id: I.duong, name: "Đường", unit: "kg" },
      { id: I.dau_an, name: "Dầu ăn", unit: "lít" },
      { id: I.nam_kim_cham, name: "Nấm kim châm", unit: "kg" },
      { id: I.cai_thao, name: "Cải thảo", unit: "kg" },
    ])
    .onConflict("id")
    .ignore();

  // ── 4. Công thức (menu_item_ingredients) ────────────────────────────────
  // quantity_needed = lượng nguyên liệu cho 1 phần ăn
  await knex("menu_item_ingredients")
    .insert([
      // -- Tôm Hùm Nướng Bơ Tỏi (1 con ~600g)
      {
        menu_item_id: M.tom_hum_bo_toi,
        ingredient_id: I.tom_hum,
        quantity_needed: 1,
      },
      {
        menu_item_id: M.tom_hum_bo_toi,
        ingredient_id: I.bo,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.tom_hum_bo_toi,
        ingredient_id: I.toi,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.tom_hum_bo_toi,
        ingredient_id: I.hanh_la,
        quantity_needed: 0.01,
      },

      // -- Tôm Sú Rang Muối (300g tôm)
      {
        menu_item_id: M.tom_su_rang_muoi,
        ingredient_id: I.tom_su,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.tom_su_rang_muoi,
        ingredient_id: I.toi,
        quantity_needed: 0.015,
      },
      {
        menu_item_id: M.tom_su_rang_muoi,
        ingredient_id: I.ot,
        quantity_needed: 0.01,
      },
      {
        menu_item_id: M.tom_su_rang_muoi,
        ingredient_id: I.dau_an,
        quantity_needed: 0.02,
      },

      // -- Tôm Thẻ Hấp Sả (300g)
      {
        menu_item_id: M.tom_the_hap_sa,
        ingredient_id: I.tom_the,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.tom_the_hap_sa,
        ingredient_id: I.sa,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.tom_the_hap_sa,
        ingredient_id: I.gung,
        quantity_needed: 0.01,
      },
      {
        menu_item_id: M.tom_the_hap_sa,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.02,
      },

      // -- Tôm Lăn Bột Chiên Giòn (250g)
      {
        menu_item_id: M.tom_bot_chien,
        ingredient_id: I.tom_su,
        quantity_needed: 0.25,
      },
      {
        menu_item_id: M.tom_bot_chien,
        ingredient_id: I.bot_chien_gion,
        quantity_needed: 0.05,
      },
      {
        menu_item_id: M.tom_bot_chien,
        ingredient_id: I.dau_an,
        quantity_needed: 0.1,
      },
      {
        menu_item_id: M.tom_bot_chien,
        ingredient_id: I.toi,
        quantity_needed: 0.01,
      },

      // -- Cua Rang Me (500g cua)
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.cua_bien,
        quantity_needed: 0.5,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.me,
        quantity_needed: 0.05,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.toi,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.sate,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.duong,
        quantity_needed: 0.01,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.cua_rang_me,
        ingredient_id: I.dau_an,
        quantity_needed: 0.03,
      },

      // -- Ghẹ Hấp Bia (500g ghẹ)
      {
        menu_item_id: M.ghe_hap_bia,
        ingredient_id: I.ghe,
        quantity_needed: 0.5,
      },
      { menu_item_id: M.ghe_hap_bia, ingredient_id: I.bia, quantity_needed: 1 },
      {
        menu_item_id: M.ghe_hap_bia,
        ingredient_id: I.sa,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ghe_hap_bia,
        ingredient_id: I.gung,
        quantity_needed: 0.02,
      },

      // -- Cua Biển Luộc (600g)
      {
        menu_item_id: M.cua_luoc,
        ingredient_id: I.cua_bien,
        quantity_needed: 0.6,
      },
      { menu_item_id: M.cua_luoc, ingredient_id: I.sa, quantity_needed: 0.03 },
      {
        menu_item_id: M.cua_luoc,
        ingredient_id: I.gung,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.cua_luoc,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.02,
      },

      // -- Cá Lóc Nướng Trui (1 con ~500g)
      {
        menu_item_id: M.ca_loc_nuong,
        ingredient_id: I.ca_loc,
        quantity_needed: 0.5,
      },
      {
        menu_item_id: M.ca_loc_nuong,
        ingredient_id: I.sa,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ca_loc_nuong,
        ingredient_id: I.gung,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.ca_loc_nuong,
        ingredient_id: I.hanh_la,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.ca_loc_nuong,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.03,
      },

      // -- Cá Hồng Hấp Gừng Hành (600g)
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.ca_hong,
        quantity_needed: 0.6,
      },
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.gung,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.hanh_la,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.toi,
        quantity_needed: 0.015,
      },
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ca_hong_hap,
        ingredient_id: I.dau_an,
        quantity_needed: 0.02,
      },

      // -- Cá Điêu Hồng Chiên Giòn (700g)
      {
        menu_item_id: M.ca_dieu_hong_chien,
        ingredient_id: I.ca_dieu_hong,
        quantity_needed: 0.7,
      },
      {
        menu_item_id: M.ca_dieu_hong_chien,
        ingredient_id: I.bot_chien_gion,
        quantity_needed: 0.04,
      },
      {
        menu_item_id: M.ca_dieu_hong_chien,
        ingredient_id: I.dau_an,
        quantity_needed: 0.15,
      },
      {
        menu_item_id: M.ca_dieu_hong_chien,
        ingredient_id: I.toi,
        quantity_needed: 0.015,
      },
      {
        menu_item_id: M.ca_dieu_hong_chien,
        ingredient_id: I.ot,
        quantity_needed: 0.01,
      },

      // -- Mực Nướng Sa Tế (300g)
      {
        menu_item_id: M.muc_nuong_sate,
        ingredient_id: I.muc_ong,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.muc_nuong_sate,
        ingredient_id: I.sate,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.muc_nuong_sate,
        ingredient_id: I.toi,
        quantity_needed: 0.015,
      },
      {
        menu_item_id: M.muc_nuong_sate,
        ingredient_id: I.ot,
        quantity_needed: 0.01,
      },
      {
        menu_item_id: M.muc_nuong_sate,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.02,
      },

      // -- Mực Chiên Giòn (300g)
      {
        menu_item_id: M.muc_chien_gion,
        ingredient_id: I.muc_ong,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.muc_chien_gion,
        ingredient_id: I.bot_chien_gion,
        quantity_needed: 0.05,
      },
      {
        menu_item_id: M.muc_chien_gion,
        ingredient_id: I.dau_an,
        quantity_needed: 0.1,
      },
      {
        menu_item_id: M.muc_chien_gion,
        ingredient_id: I.toi,
        quantity_needed: 0.01,
      },

      // -- Bạch Tuộc Xào Cay (300g)
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.bach_tuoc,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.sate,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.toi,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.ot,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.hanh_la,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.dau_an,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.bach_tuoc_xao_cay,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.015,
      },

      // -- Hàu Nướng Mỡ Hành (6 con)
      {
        menu_item_id: M.hau_nuong_mo_hanh,
        ingredient_id: I.hau,
        quantity_needed: 6,
      },
      {
        menu_item_id: M.hau_nuong_mo_hanh,
        ingredient_id: I.hanh_la,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.hau_nuong_mo_hanh,
        ingredient_id: I.dau_an,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.hau_nuong_mo_hanh,
        ingredient_id: I.toi,
        quantity_needed: 0.01,
      },

      // -- Sò Điệp Nướng Phô Mai (4 con)
      {
        menu_item_id: M.so_diep_pho_mai,
        ingredient_id: I.so_diep,
        quantity_needed: 4,
      },
      {
        menu_item_id: M.so_diep_pho_mai,
        ingredient_id: I.pho_mai,
        quantity_needed: 0.06,
      },
      {
        menu_item_id: M.so_diep_pho_mai,
        ingredient_id: I.bo,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.so_diep_pho_mai,
        ingredient_id: I.toi,
        quantity_needed: 0.01,
      },

      // -- Nghêu Hấp Sả (400g)
      {
        menu_item_id: M.ngheu_hap_sa,
        ingredient_id: I.ngheu,
        quantity_needed: 0.4,
      },
      {
        menu_item_id: M.ngheu_hap_sa,
        ingredient_id: I.sa,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.ngheu_hap_sa,
        ingredient_id: I.gung,
        quantity_needed: 0.01,
      },
      {
        menu_item_id: M.ngheu_hap_sa,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.ngheu_hap_sa,
        ingredient_id: I.ot,
        quantity_needed: 0.005,
      },

      // -- Lẩu Hải Sản Thái Chua Cay (2 người)
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.tom_the,
        quantity_needed: 0.2,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.muc_ong,
        quantity_needed: 0.15,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.ngheu,
        quantity_needed: 0.2,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.nam_kim_cham,
        quantity_needed: 0.1,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.sa,
        quantity_needed: 0.04,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.gung,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.ot,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.sate,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.04,
      },
      {
        menu_item_id: M.lau_thai_chua_cay,
        ingredient_id: I.duong,
        quantity_needed: 0.01,
      },

      // -- Lẩu Hải Sản Dừa (2 người)
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.tom_the,
        quantity_needed: 0.2,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.cua_bien,
        quantity_needed: 0.3,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.muc_ong,
        quantity_needed: 0.15,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.bach_tuoc,
        quantity_needed: 0.1,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.nuoc_dua,
        quantity_needed: 0.5,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.cai_thao,
        quantity_needed: 0.2,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.nam_kim_cham,
        quantity_needed: 0.1,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.sa,
        quantity_needed: 0.03,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.gung,
        quantity_needed: 0.02,
      },
      {
        menu_item_id: M.lau_hai_san_dua,
        ingredient_id: I.nuoc_mam,
        quantity_needed: 0.03,
      },
    ])
    .onConflict(["menu_item_id", "ingredient_id"])
    .ignore();

  // ── 5. Inventory (tồn kho ban đầu) ──────────────────────────────────────
  const inventoryData = [
    { ingredient_id: I.tom_hum, current_stock: 20 },
    { ingredient_id: I.tom_su, current_stock: 5 },
    { ingredient_id: I.tom_the, current_stock: 8 },
    { ingredient_id: I.cua_bien, current_stock: 10 },
    { ingredient_id: I.ghe, current_stock: 7 },
    { ingredient_id: I.ca_loc, current_stock: 6 },
    { ingredient_id: I.ca_hong, current_stock: 8 },
    { ingredient_id: I.ca_dieu_hong, current_stock: 10 },
    { ingredient_id: I.muc_ong, current_stock: 5 },
    { ingredient_id: I.bach_tuoc, current_stock: 4 },
    { ingredient_id: I.hau, current_stock: 120 },
    { ingredient_id: I.so_diep, current_stock: 80 },
    { ingredient_id: I.ngheu, current_stock: 6 },
    { ingredient_id: I.toi, current_stock: 2 },
    { ingredient_id: I.hanh_la, current_stock: 1 },
    { ingredient_id: I.sa, current_stock: 1.5 },
    { ingredient_id: I.gung, current_stock: 1 },
    { ingredient_id: I.ot, current_stock: 0.5 },
    { ingredient_id: I.me, current_stock: 1 },
    { ingredient_id: I.bo, current_stock: 0.5 },
    { ingredient_id: I.sate, current_stock: 0.5 },
    { ingredient_id: I.pho_mai, current_stock: 1 },
    { ingredient_id: I.bia, current_stock: 48 },
    { ingredient_id: I.nuoc_dua, current_stock: 5 },
    { ingredient_id: I.bot_chien_gion, current_stock: 2 },
    { ingredient_id: I.nuoc_mam, current_stock: 3 },
    { ingredient_id: I.duong, current_stock: 2 },
    { ingredient_id: I.dau_an, current_stock: 5 },
    { ingredient_id: I.nam_kim_cham, current_stock: 2 },
    { ingredient_id: I.cai_thao, current_stock: 3 },
  ];

  await knex("inventory")
    .insert(inventoryData)
    .onConflict("ingredient_id")
    .ignore();

  // ── 6. Variants kích cỡ (áp dụng cho các món hải sản có size) ──────────
  await knex("menu_item_variants")
    .insert([
      // Tôm Hùm (trọng lượng)
      {
        id: "e1000000-0000-0000-0000-000000000001",
        menu_item_id: M.tom_hum_bo_toi,
        label: "Size Vừa (~500g)",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000002",
        menu_item_id: M.tom_hum_bo_toi,
        label: "Size Lớn (~800g)",
        price_extra: 200000,
        is_default: false,
        sort_order: 2,
      },

      // Cua Rang Me
      {
        id: "e1000000-0000-0000-0000-000000000003",
        menu_item_id: M.cua_rang_me,
        label: "Size Vừa (~500g)",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000004",
        menu_item_id: M.cua_rang_me,
        label: "Size Lớn (~800g)",
        price_extra: 150000,
        is_default: false,
        sort_order: 2,
      },

      // Cua Biển Luộc
      {
        id: "e1000000-0000-0000-0000-000000000005",
        menu_item_id: M.cua_luoc,
        label: "Size Vừa (~600g)",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000006",
        menu_item_id: M.cua_luoc,
        label: "Size Lớn (~1kg)",
        price_extra: 200000,
        is_default: false,
        sort_order: 2,
      },

      // Lẩu (số người)
      {
        id: "e1000000-0000-0000-0000-000000000007",
        menu_item_id: M.lau_thai_chua_cay,
        label: "2 người",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000008",
        menu_item_id: M.lau_thai_chua_cay,
        label: "4 người",
        price_extra: 250000,
        is_default: false,
        sort_order: 2,
      },

      {
        id: "e1000000-0000-0000-0000-000000000009",
        menu_item_id: M.lau_hai_san_dua,
        label: "2 người",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000010",
        menu_item_id: M.lau_hai_san_dua,
        label: "4 người",
        price_extra: 230000,
        is_default: false,
        sort_order: 2,
      },

      // Hàu (số lượng)
      {
        id: "e1000000-0000-0000-0000-000000000011",
        menu_item_id: M.hau_nuong_mo_hanh,
        label: "6 con",
        price_extra: 0,
        is_default: true,
        sort_order: 1,
      },
      {
        id: "e1000000-0000-0000-0000-000000000012",
        menu_item_id: M.hau_nuong_mo_hanh,
        label: "12 con",
        price_extra: 150000,
        is_default: false,
        sort_order: 2,
      },
    ])
    .onConflict("id")
    .ignore();

  console.log(
    "✅ Seed hoàn tất: 6 danh mục, 18 món, 30 nguyên liệu, công thức đầy đủ, tồn kho ban đầu.",
  );
};
