/* Shared middleware: load the current user, gate routes, and flash messages. */

const { one } = require("./db.js");

async function loadUser(req, res, next) {
  req.user = null;
  if (req.session && req.session.uid) {
    try {
      req.user = await one("SELECT * FROM users WHERE id = $1", [req.session.uid]);
    } catch (e) {
      /* db hiccup: treat as logged out */
    }
    if (!req.user) req.session.uid = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login?next=" + encodeURIComponent(req.originalUrl));
  next();
}

function requireVerified(req, res, next) {
  if (!req.user) return res.redirect("/login?next=" + encodeURIComponent(req.originalUrl));
  if (!req.user.email_verified) return res.redirect("/verify-needed");
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect("/login?next=" + encodeURIComponent(req.originalUrl));
  if (req.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}

function setFlash(req, type, msg) {
  if (req.session) req.session.flash = { type, msg };
}

function takeFlash(req) {
  if (!req.session) return null;
  const f = req.session.flash;
  req.session.flash = null;
  return f;
}

module.exports = { loadUser, requireAuth, requireVerified, requireAdmin, setFlash, takeFlash };
