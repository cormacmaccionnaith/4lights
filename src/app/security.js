/* Security middleware: helmet headers, session (Postgres-backed), and rate
   limiters for the auth endpoints. */

const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const PgSession = require("connect-pg-simple")(session);
const { getPool } = require("./db.js");

const isProd = process.env.NODE_ENV === "production";

// Keep helmet's protections but leave CSP off so the existing static site
// (Google Fonts, inline SVG/styles) is unaffected. Can be tightened later.
const helmetMw = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

function sessionMw() {
  return session({
    name: "t4l.sid",
    store: new PgSession({ pool: getPool(), tableName: "session", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "dev-insecure-secret-change-me",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts. Please wait a few minutes and try again.",
});

module.exports = { helmetMw, sessionMw, authLimiter, isProd };
