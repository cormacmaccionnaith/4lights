/* Authentication routes: register, verify, login, logout, password reset. */

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query, one } = require("./db.js");
const { ensureEntries } = require("./migrate.js");
const { csrfToken, verifyCsrf } = require("./csrf.js");
const { requireAuth, setFlash, takeFlash } = require("./middleware.js");
const { authLimiter } = require("./security.js");
const mail = require("./mail.js");
const views = require("./views.js");

const router = express.Router();

const norm = (s) => String(s || "").trim().toLowerCase();
const token = () => crypto.randomBytes(24).toString("hex");
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ---- register -------------------------------------------------------------

router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/account");
  res.send(views.renderRegister({ csrf: csrfToken(req), flash: takeFlash(req) }));
});

router.post("/register", authLimiter, verifyCsrf, async (req, res) => {
  const values = {
    full_name: String(req.body.full_name || "").trim(),
    email: norm(req.body.email),
  };
  const { password, password2 } = req.body;
  const fail = (msg) => {
    setFlash(req, "error", msg);
    res.send(views.renderRegister({ csrf: csrfToken(req), flash: takeFlash(req), values }));
  };

  if (!values.full_name) return fail("Please enter your name.");
  if (!validEmail(values.email)) return fail("Please enter a valid email.");
  if (!password || password.length < 8) return fail("Password must be at least 8 characters.");
  if (password !== password2) return fail("Passwords do not match.");

  const existing = await one("SELECT id FROM users WHERE email = $1", [values.email]);
  if (existing) return fail("An account with that email already exists. Try logging in.");

  const vtoken = token();
  const user = await one(
    `INSERT INTO users (email, password_hash, full_name, role, verify_token)
     VALUES ($1, $2, $3, 'swimmer', $4) RETURNING *`,
    [values.email, bcrypt.hashSync(password, 12), values.full_name, vtoken]
  );
  await ensureEntries(user.id);
  await mail.sendVerify(user, vtoken);

  req.session.regenerate((err) => {
    if (err) {
      setFlash(req, "info", "Account created. Please log in.");
      return res.redirect("/login");
    }
    req.session.uid = user.id;
    setFlash(req, "success", "Account created. Check your email to confirm your address.");
    req.session.save(() => res.redirect("/verify-needed"));
  });
});

// ---- email verification ---------------------------------------------------

router.get("/verify", async (req, res) => {
  const t = String(req.query.token || "");
  const user = t ? await one("SELECT * FROM users WHERE verify_token = $1", [t]) : null;
  if (!user) {
    return res.send(
      views.renderMessage({
        user: req.user,
        title: "Verify email",
        heading: "That link didn't work",
        message: "The confirmation link is invalid or has already been used. Try logging in.",
      })
    );
  }
  await query("UPDATE users SET email_verified = TRUE, verify_token = NULL, updated_at = now() WHERE id = $1", [
    user.id,
  ]);
  setFlash(req, "success", "Email confirmed. Welcome to The Four Lights.");
  if (req.session) req.session.uid = user.id;
  res.redirect("/account");
});

router.get("/verify-needed", requireAuth, (req, res) => {
  if (req.user.email_verified) return res.redirect("/account");
  const safeEmail = String(req.user.email).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = `<div class="authcard">
    <h1 class="app__h">Confirm your email</h1>
    <p class="app__lead">We've sent a confirmation link to <strong>${safeEmail}</strong>. Click it to activate your account.</p>
    <form method="post" action="/verify-needed" class="form">
      <input type="hidden" name="_csrf" value="${csrfToken(req)}">
      <button class="btn btn--beam btn--sm" type="submit">Resend confirmation email</button>
    </form>
  </div>`;
  res.send(views.appLayout({ title: "Confirm email", user: req.user, body, flash: takeFlash(req) }));
});

router.post("/verify-needed", requireAuth, verifyCsrf, async (req, res) => {
  if (!req.user.email_verified) {
    const vtoken = token();
    await query("UPDATE users SET verify_token = $1 WHERE id = $2", [vtoken, req.user.id]);
    await mail.sendVerify(req.user, vtoken);
  }
  setFlash(req, "success", "Confirmation email resent.");
  res.redirect("/verify-needed");
});

// ---- login / logout -------------------------------------------------------

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/account");
  res.send(
    views.renderLogin({ csrf: csrfToken(req), flash: takeFlash(req), next: String(req.query.next || "") })
  );
});

router.post("/login", authLimiter, verifyCsrf, async (req, res) => {
  const email = norm(req.body.email);
  const password = String(req.body.password || "");
  const next = String(req.body.next || "");
  const user = await one("SELECT * FROM users WHERE email = $1", [email]);
  const ok = user && bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    setFlash(req, "error", "Email or password is incorrect.");
    return res.send(views.renderLogin({ csrf: csrfToken(req), flash: takeFlash(req), email, next }));
  }
  req.session.regenerate((err) => {
    if (err) {
      setFlash(req, "error", "Could not start a session. Try again.");
      return res.redirect("/login");
    }
    req.session.uid = user.id;
    req.session.save(() => {
      const dest = next && next.startsWith("/") ? next : "/account";
      res.redirect(dest);
    });
  });
});

router.post("/logout", verifyCsrf, (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ---- password reset -------------------------------------------------------

router.get("/forgot", (req, res) => {
  res.send(views.renderForgot({ csrf: csrfToken(req), flash: takeFlash(req) }));
});

router.post("/forgot", authLimiter, verifyCsrf, async (req, res) => {
  const email = norm(req.body.email);
  const user = validEmail(email) ? await one("SELECT * FROM users WHERE email = $1", [email]) : null;
  if (user) {
    const rtoken = token();
    await query("UPDATE users SET reset_token = $1, reset_expires = now() + interval '1 hour' WHERE id = $2", [
      rtoken,
      user.id,
    ]);
    await mail.sendReset(user, rtoken);
  }
  setFlash(req, "success", "If an account exists for that email, a reset link is on its way.");
  res.redirect("/login");
});

router.get("/reset", async (req, res) => {
  const t = String(req.query.token || "");
  const user = t
    ? await one("SELECT id FROM users WHERE reset_token = $1 AND reset_expires > now()", [t])
    : null;
  if (!user) {
    return res.send(
      views.renderMessage({
        title: "Reset password",
        heading: "That link has expired",
        message: "Password reset links are valid for one hour. Please request a new one.",
      })
    );
  }
  res.send(views.renderReset({ csrf: csrfToken(req), flash: takeFlash(req), token: t }));
});

router.post("/reset", authLimiter, verifyCsrf, async (req, res) => {
  const t = String(req.body.token || "");
  const { password, password2 } = req.body;
  const user = t
    ? await one("SELECT * FROM users WHERE reset_token = $1 AND reset_expires > now()", [t])
    : null;
  if (!user) {
    setFlash(req, "error", "That reset link has expired. Please request a new one.");
    return res.redirect("/forgot");
  }
  if (!password || password.length < 8 || password !== password2) {
    setFlash(req, "error", "Passwords must match and be at least 8 characters.");
    return res.send(views.renderReset({ csrf: csrfToken(req), flash: takeFlash(req), token: t }));
  }
  await query(
    "UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL, email_verified = TRUE, updated_at = now() WHERE id = $2",
    [bcrypt.hashSync(password, 12), user.id]
  );
  setFlash(req, "success", "Password updated. You can log in now.");
  res.redirect("/login");
});

module.exports = router;
