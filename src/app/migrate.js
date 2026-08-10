/*
 * Apply the schema and seed the admin account. Runs on every boot; all steps
 * are idempotent. Safe no-op when DATABASE_URL is not configured.
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { hasDb, query, one } = require("./db.js");
const { SWIMS } = require("../content/swims.js");

const SWIM_SLUGS = SWIMS.map((s) => s.slug);

async function migrate() {
  if (!hasDb()) {
    console.log("[migrate] DATABASE_URL not set — running in marketing-only mode.");
    return false;
  }
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await query(schema);
  console.log("[migrate] schema applied.");
  await seedAdmin();
  return true;
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "cormacmaccionnaith@gmail.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const existing = await one("SELECT id, role FROM users WHERE email = $1", [email]);

  if (existing) {
    // Always ensure the account is an admin and verified.
    await query("UPDATE users SET role = 'admin', email_verified = TRUE, updated_at = now() WHERE id = $1", [
      existing.id,
    ]);
    if (password && process.env.ADMIN_PASSWORD_RESET === "1") {
      await query("UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2", [
        bcrypt.hashSync(password, 12),
        existing.id,
      ]);
      console.log(`[migrate] admin password reset for ${email}.`);
    }
    console.log(`[migrate] admin ensured: ${email}`);
    return;
  }

  if (!password) {
    console.warn(
      `[migrate] admin ${email} does not exist and ADMIN_PASSWORD is not set — skipping seed. ` +
        `Set ADMIN_PASSWORD and redeploy to create it.`
    );
    return;
  }
  await query(
    `INSERT INTO users (email, password_hash, role, full_name, email_verified)
     VALUES ($1, $2, 'admin', 'Administrator', TRUE)`,
    [email, bcrypt.hashSync(password, 12)]
  );
  console.log(`[migrate] admin created: ${email}`);
}

// Ensure a user has an entry row for all four swims; returns them in series order.
async function ensureEntries(userId) {
  for (const slug of SWIM_SLUGS) {
    await query(
      `INSERT INTO swim_entries (user_id, swim_slug) VALUES ($1, $2)
       ON CONFLICT (user_id, swim_slug) DO NOTHING`,
      [userId, slug]
    );
  }
  const { rows } = await query("SELECT * FROM swim_entries WHERE user_id = $1", [userId]);
  const bySlug = Object.fromEntries(rows.map((r) => [r.swim_slug, r]));
  return SWIM_SLUGS.map((slug) => bySlug[slug]).filter(Boolean);
}

module.exports = { migrate, ensureEntries, SWIM_SLUGS };
