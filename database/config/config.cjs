require('dotenv').config();

function buildConfig() {
  const password = process.env.DB_PASSWORD ?? '';

  return {
    username: process.env.DB_USER || 'postgres',
    password,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
  };
}

module.exports = {
  development: buildConfig(),
  production: buildConfig(),
};
