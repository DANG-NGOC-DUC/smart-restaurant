export const up = async (knex) => {
  await knex.schema.alterTable("tables", (t) => {
    t.string("name").notNullable().defaultTo(""); // tên bàn (VD: "Bàn 1", "Bàn VIP")
    t.string("qr_token").unique(); // chuỗi ngẫu nhiên dùng cho QR code
  });

  // Sinh qr_token cho các bàn đã có sẵn
  const tables = await knex("tables").select("id");
  for (const table of tables) {
    const token = generateToken(8);
    await knex("tables").where({ id: table.id }).update({ qr_token: token });
  }

  // Sau khi đã fill data, set NOT NULL
  await knex.schema.alterTable("tables", (t) => {
    t.string("qr_token").notNullable().alter();
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable("tables", (t) => {
    t.dropColumn("name");
    t.dropColumn("qr_token");
  });
};

function generateToken(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
