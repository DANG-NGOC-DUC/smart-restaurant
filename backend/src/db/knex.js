import knex from "knex";
import knexConfig from "../../knexfile.js";

const env = process.env.NODE_ENV || "development";
const config = knexConfig[env] || knexConfig.development;

export default knex(config);
