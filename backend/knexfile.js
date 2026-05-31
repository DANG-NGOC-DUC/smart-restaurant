import dotenv from "dotenv";
dotenv.config();

const baseConfig = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeders",
  },
};

export default {
  development: baseConfig,
  production: baseConfig,
};
