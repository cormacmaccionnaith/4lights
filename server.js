#!/usr/bin/env node
/*
 * The Four Lights — application server.
 *
 * Always serves the static marketing site (generated HTML + /assets) and the
 * health check at "/". When DATABASE_URL is configured and migrations succeed,
 * it also mounts the account/admin application. If the database is absent or
 * unreachable, the marketing site stays up and the app paths return a friendly
 * "coming soon" 503 — so deploying before Postgres is provisioned never takes
 * the site down.
 */

try {
  require("dotenv").config();
} catch (_) {
  /* dotenv optional */
}

const path = require("path");
const fs = require("fs");
const express = require("express");
const { hasDb } = require("./src/app/db.js");
const { migrate } = require("./src/app/migrate.js");
const { helmetMw, sessionMw } = require("./src/app/security.js");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const MARKETING_PAGES = new Set([
  "index.html",
  "fastnet.html",
  "black-head.html",
  "kish.html",
  "rathlin.html",
  "rules.html",
  "contact.html",
  "404.html",
]);

const APP_PATHS = [
  "/login",
  "/register",
  "/forgot",
  "/reset",
  "/verify",
  "/verify-needed",
  "/account",
  "/admin",
  "/logout",
];

function isAppPath(p) {
  return APP_PATHS.some((base) => p === base || p.startsWith(base + "/"));
}

function maintenancePage(res) {
  res
    .status(503)
    .type("html")
    .send(
      `<!doctype html><meta charset="utf-8"><title>Coming soon — The Four Lights</title>
<body style="margin:0;background:#08111c;color:#e6e1d5;font-family:Helvetica,Arial,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center">
<div style="max-width:32rem;padding:2rem">
<p style="letter-spacing:.28em;text-transform:uppercase;color:#e2ac5b;font-size:.75rem;font-weight:bold">The Four Lights</p>
<h1 style="font-family:Georgia,serif;font-weight:500">Swimmer accounts are coming soon</h1>
<p style="color:#94a6ba">This part of the site isn't live yet. In the meantime, read the swims and get in touch.</p>
<p><a href="/" style="color:#e2ac5b">← Back to The Four Lights</a></p>
</div></body>`
    );
}

async function bootstrap() {
  const app = express();
  app.set("trust proxy", 1); // Railway / Cloudflare terminate TLS in front of us
  app.disable("x-powered-by");

  app.use(helmetMw);
  app.use("/assets", express.static(path.join(ROOT, "assets"), { maxAge: "1h" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(express.json({ limit: "256kb" })); // inline-editor API

  // Bring up the database + app if configured; otherwise marketing-only.
  let dbReady = false;
  let dbError = null;
  if (hasDb()) {
    try {
      dbReady = await migrate();
    } catch (err) {
      dbError = err;
      console.error("[boot] database/migration failed — serving marketing only:", err.message);
      dbReady = false;
    }
  }

  /*
   * Deployment diagnostics. Reports whether the pieces the app needs are
   * actually wired up, so a misconfigured deploy can be diagnosed without
   * dashboard access. Deliberately leaks nothing: booleans plus an error
   * code, never the connection string, credentials or hostnames.
   */
  app.get("/healthz", async (req, res) => {
    const redact = (s) =>
      String(s || "")
        .replace(/postgres(ql)?:\/\/[^\s]*/gi, "[redacted]")
        .replace(/\b[\w.-]+\.(railway\.internal|rlwy\.net|railway\.app)\b/gi, "[host]")
        .slice(0, 140);

    const out = {
      ok: true,
      mode: dbReady ? "accounts" : "marketing-only",
      db: {
        urlPresent: Boolean(process.env.DATABASE_URL),
        ready: dbReady,
        error: dbError ? redact(dbError.code || dbError.message) : null,
      },
      uploads: { dir: process.env.UPLOAD_DIR || "(default)", writable: false },
      mail: { keyPresent: Boolean(process.env.MAILERSEND_API_KEY), from: Boolean(process.env.MAIL_FROM) },
      env: {
        appUrl: Boolean(process.env.APP_URL),
        sessionSecret: Boolean(process.env.SESSION_SECRET),
        adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      },
    };

    // Is the uploads directory actually writable (i.e. is the Volume mounted)?
    try {
      const dir = process.env.UPLOAD_DIR || path.join(ROOT, "data/uploads");
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      out.uploads.writable = true;
    } catch (err) {
      out.uploads.error = redact(err.code || err.message);
    }

    // Where is it actually trying to connect, and does that host resolve?
    // Distinguishes "wrong/no such host" from "host exists, nothing listening".
    if (out.db.urlPresent) {
      try {
        const u = new URL(process.env.DATABASE_URL);
        const host = u.hostname;
        const internal = /\.railway\.internal$/i.test(host) || /^(localhost|127\.|::1)/i.test(host);
        out.db.target = {
          host: internal ? host : "[external host]",
          port: u.port || "5432",
          database: u.pathname.replace(/^\//, "") || "(none)",
          kind: /\.railway\.internal$/i.test(host)
            ? "railway-internal"
            : /^(localhost|127\.|::1)/i.test(host)
            ? "localhost"
            : "external",
          hasPassword: Boolean(u.password),
        };
        try {
          const addrs = await require("dns").promises.lookup(host, { all: true, verbatim: true });
          out.db.target.dns = addrs.map((a) => (internal ? a.address : `IPv${a.family}`));
        } catch (e) {
          out.db.target.dns = "lookup failed: " + (e.code || e.message);
        }
      } catch (e) {
        out.db.target = { error: "DATABASE_URL is not a valid connection URL" };
      }
    }

    // If a URL is configured but the app came up without it, retry once now so
    // the report reflects the live state rather than only boot time.
    if (out.db.urlPresent && !dbReady) {
      try {
        const { query } = require("./src/app/db.js");
        await query("SELECT 1");
        out.db.reachableNow = true;
        out.db.note = "Database reachable now — redeploy to enable accounts.";
      } catch (err) {
        out.db.reachableNow = false;
        out.db.error = redact(err.code || err.message);
      }
    }

    res.type("json").send(JSON.stringify(out, null, 2));
  });

  if (dbReady) {
    app.use(sessionMw());
    const { loadUser } = require("./src/app/middleware.js");
    const { csrfToken } = require("./src/app/csrf.js");
    app.use(loadUser);
    // Guarantee a CSRF token exists for every session (survives login's
    // session regeneration), so all rendered forms carry a valid token.
    app.use((req, res, next) => {
      csrfToken(req);
      next();
    });
    app.use(require("./src/app/auth.js"));
    app.use(require("./src/app/account.js"));
    app.use(require("./src/app/admin.js"));
  } else {
    app.use((req, res, next) => (isAppPath(req.path) ? maintenancePage(res) : next()));
  }

  // Static marketing site. Visitors get the file as-is; a logged-in admin also
  // gets the inline content editor injected into the page.
  function sendPage(req, res, file) {
    const full = path.join(ROOT, file);
    const isAdmin = dbReady && req.user && req.user.role === "admin";
    if (!isAdmin) return res.sendFile(full);

    fs.readFile(full, "utf8", (err, html) => {
      if (err) return res.status(404).type("txt").send("Not found");
      const { csrfToken } = require("./src/app/csrf.js");
      const inject =
        `<link rel="stylesheet" href="/assets/css/edit.css">` +
        `<script>window.__T4L_EDIT__=${JSON.stringify({ csrf: csrfToken(req) })};</script>` +
        `<script src="/assets/js/edit.js" defer></script>`;
      res.set("Cache-Control", "no-store");
      res.type("html").send(html.replace("</body>", inject + "</body>"));
    });
  }

  // Swim pages were renamed when the swims took their route names. Keep the
  // old URLs working permanently so existing links and search results survive.
  const RENAMED = {
    "/kish-bank.html": "/kish.html",
    "/altacarry-head.html": "/rathlin.html",
    "/kish-bank": "/kish.html",
    "/altacarry-head": "/rathlin.html",
  };
  app.get(Object.keys(RENAMED), (req, res) => res.redirect(301, RENAMED[req.path]));

  app.get("/", (req, res) => sendPage(req, res, "index.html"));
  app.get("/:page", (req, res, next) => {
    if (MARKETING_PAGES.has(req.params.page)) return sendPage(req, res, req.params.page);
    next();
  });

  // 404 — styled marketing page when present.
  app.use((req, res) => {
    res.status(404).sendFile(path.join(ROOT, "404.html"), (err) => {
      if (err) res.status(404).type("txt").send("Not found");
    });
  });

  // Error handler — never leak internals.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[error]", err.message);
    if (res.headersSent) return;
    res.status(500).type("txt").send("Something went wrong. Please try again.");
  });

  app.listen(PORT, HOST, () => {
    console.log(
      `The Four Lights on http://${HOST}:${PORT} — ${dbReady ? "accounts enabled" : "marketing only"}`
    );
  });
}

bootstrap().catch((err) => {
  console.error("[boot] fatal:", err);
  process.exit(1);
});
