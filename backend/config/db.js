const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Most managed cloud MySQL providers (PlanetScale, Railway, Aiven, RDS) require SSL.
  // Set DB_SSL=true in .env if your provider requires it.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

// Handle pool-level errors (e.g. MySQL server restart, network issues).
// Without this, an unhandled 'error' event on the pool would crash the process.
pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

module.exports = pool;
