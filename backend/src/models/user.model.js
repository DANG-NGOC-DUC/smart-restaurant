import knex from "../db/knex.js";

const TABLE = "users";

export const UserModel = {
  async create(user) {
    const [created] = await knex(TABLE).insert(user).returning("*");
    return created;
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByEmail(email) {
    return knex(TABLE).where({ email }).first();
  },

  async findByPhone(phone) {
    return knex(TABLE).where({ phone }).first();
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },

  async findAll(
    fields = ["id", "email", "role", "phone"],
    page = 1,
    pageSize = 20,
  ) {
    return knex(TABLE)
      .select(fields)
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  },

  async delete(id) {
    return knex(TABLE).where({ id }).del();
  },

  async count() {
    const result = await knex(TABLE).count("id as count").first();
    return parseInt(result.count, 10);
  },
};
