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
    roles = null,
  ) {
    const query = knex(TABLE).select(fields);
    if (roles && roles.length > 0) {
      query.whereIn("role", roles);
    }
    return query.limit(pageSize).offset((page - 1) * pageSize);
  },

  async delete(id) {
    return knex(TABLE).where({ id }).del();
  },

  async count(roles = null) {
    const query = knex(TABLE).count("id as count");
    if (roles && roles.length > 0) {
      query.whereIn("role", roles);
    }
    const result = await query.first();
    return parseInt(result.count, 10);
  },
};
