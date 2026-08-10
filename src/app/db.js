/*
 * Postgres access. A single pool, a query helper, and a guard the rest of
 * the app uses to decide whether account features are available at all.
 *
 * If DATABASE_URL is not set, hasDb() returns false and the server runs in
 * "marketing only" mode (the static site stays up; account routes 503).
 */

const { Pool } = require("pg");

let pool = null;

function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!hasDb()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway internal networking needs no SSL; set DATABASE_SSL=require for
      // external/proxied connections.
      ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    pool.on("error", (err) => console.error("pg pool error:", err.message));
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  return p.query(text, params);
}

// Convenience: first row or null.
async function one(text, params) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

module.exports = { hasDb, getPool, query, one };
