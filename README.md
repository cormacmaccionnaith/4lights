# The Four Lights — Na Ceithre Soilse

A prestige open-water swimming challenge around the four provinces of Ireland:
one lighthouse per province, one certified 10 km+ crossing to each.

- **Fastnet Rock** — Munster — ≈ 20 km — Fastnet Rock ⇄ Co. Cork (typically Baltimore)
- **Black Head** — Connacht — ≈ 20 km — Black Head ⇄ Co. Galway (must finish in Galway)
- **Kish Bank** — Leinster — ≈ 20 km — Kish Bank ⇄ Co. Wicklow (typically Greystones)
- **Altacarry Head (Rathlin)** — Ulster — ≈ 12 km — Altacarry Head ⇄ Co. Antrim (typically Ballycastle)

The site has two parts:

1. **A static, content-led marketing site** (the swims, rules & safety, contact).
2. **A swimmer account application** — registration, per-swim progress tracking,
   document uploads, an admin dashboard, and MailerSend email.

## Running

```bash
npm install
npm run build      # regenerate the static marketing HTML from src/content + src/templates
npm start          # build + start the server (http://localhost:3000)
```

`npm start` runs `node src/build.js && node server.js`. The server **always**
serves the marketing site. It additionally enables the account application when
`DATABASE_URL` is set and migrations succeed; otherwise account/admin paths
return a friendly 503 and the marketing site stays up (so deploying before the
database exists never takes the site down).

### Local development with Postgres

```bash
cp .env.example .env          # then edit values
createdb fourlights           # or point DATABASE_URL at any Postgres
npm start
```

With no `MAILERSEND_API_KEY`, verification/reset emails are **logged to the
console** instead of sent — copy the link from the log to continue.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Absent → marketing-only mode. |
| `DATABASE_SSL` | Set to `require` for external/proxied Postgres (e.g. some Railway setups). |
| `SESSION_SECRET` | Signs session cookies. Use a long random string. |
| `ADMIN_EMAIL` | Seeded admin address (default `cormacmaccionnaith@gmail.com`). |
| `ADMIN_PASSWORD` | Password for the seeded admin (set once, then change in-app). |
| `ADMIN_PASSWORD_RESET` | `1` to reset the admin password to `ADMIN_PASSWORD` on next boot. |
| `APP_URL` | Public base URL, used in email links (e.g. `https://swimthe4lights.org`). |
| `UPLOAD_DIR` | Where uploaded docs are stored (a persistent Volume in production). |
| `MAILERSEND_API_KEY` | MailerSend API token. Absent → emails log to console. |
| `MAIL_FROM` | Verified MailerSend sender, e.g. `no-reply@swimthe4lights.org`. |
| `MAIL_FROM_NAME` | Sender display name (default "The Four Lights"). |

## How it works

### Content & build
All copy lives in `src/content/` (`swims.js`, `site.js`). `src/build.js` renders
it through `src/templates/*.js` into static HTML at the repo root (committed).
Route-map images live in `assets/img/maps/<slug>.<ext>` (chart if present, else a
stylised SVG fallback).

### Application (`src/app/`)
- `db.js` — Postgres pool + `hasDb()` guard.
- `schema.sql` / `migrate.js` — idempotent schema + admin seed; ensures each user
  has an entry row for all four swims.
- `security.js` — helmet, Postgres-backed sessions, auth rate limiting.
- `csrf.js` — per-session CSRF token on every form.
- `uploads.js` — multer to the Volume; PDF/PNG/JPG/WEBP, 15 MB cap, random names.
- `mail.js` — MailerSend via `fetch` (verify, reset, admin/decision/series emails).
- `views.js` — server-rendered pages reusing the site's stylesheet + `app.css`.
- `auth.js` / `account.js` / `admin.js` — the route handlers.

### Inline editing (admin)
Log in as an admin and browse the site normally: every editable piece of copy
becomes click-to-edit in place. A toolbar appears at the bottom of the page —
switch **Inline editing** on, click any text, type, then press **Enter** (or
click away) to publish. **Esc** cancels an edit; clearing a field
entirely is allowed (it keeps a placeholder box while editing is on); and
**Revert field** restores the original wording. Edited fields keep a solid amber outline while editing is on.

Each save writes the field to `content_overrides`, regenerates the static HTML,
and is live for visitors immediately. Editable text is marked in the templates
with `data-ed="<content path>"`; the attribute is inert for visitors — the
editor script and its CSRF token are injected **only** for a signed-in admin,
and every save is re-validated server-side (`isInlineEditable`), so structure
(slugs, provinces, lighthouse names, map coordinates) can never be edited from
the page. The API answers 401/403 for anyone else.

### Editing site copy in forms (admin)
The marketing copy can be edited in the browser at **`/admin/content`** (admin
only). Edits are stored as overrides in the `content_overrides` table, layered
over the `src/content/*.js` defaults, and publishing re-runs the build so the
static pages update immediately and persist across redeploys. Each field shows
an **edited** tag and can be **reset to original**. Editable fields are prose
(swim stories, crossings, epithets, distances, homepage, rules, contact) — not
structure like slugs, lighthouse names or map coordinates. Requires the database
(same one that powers accounts). If you later put Cloudflare in front with
aggressive HTML caching, purge the cache after publishing.

### Status model
Swimmers set **Aspiring → Organised → Completed** themselves. **Accredited** is
granted by the admin after reviewing the uploaded accreditation documents. When
all four crossings are accredited, the admin can mark the swimmer as having
**Completed the Four Lights**.

## Deploying on Railway

The production service deploys from **`main`** (see `CLAUDE.md`). To enable
accounts you must provision two things and set the env vars:

1. **Add Postgres** — Railway → your project → *New → Database → Postgres*. It
   provides `DATABASE_URL` automatically.
2. **Add a Volume** — on the web service, *Settings → Volumes → add a Volume
   mounted at `/data`*. Set `UPLOAD_DIR=/data/uploads`.
3. **Set variables** — `SESSION_SECRET`, `ADMIN_PASSWORD`, `APP_URL`
   (`https://swimthe4lights.org`), `MAILERSEND_API_KEY`, `MAIL_FROM`,
   `MAIL_FROM_NAME`. `ADMIN_EMAIL` defaults to the address above.

Until Postgres + the Volume + `DATABASE_URL` are in place, the site runs in
marketing-only mode. Once they are, migrations run on boot, the admin is seeded,
and accounts go live.

`railway.json` sets build `npm run build` and start `npm start`, health check `/`.

## Custom domain (swimthe4lights.org via Cloudflare)

1. In Railway, on the web service: *Settings → Networking → Custom Domain* →
   add `swimthe4lights.org` (and `www`). Railway shows a target to point DNS at.
2. In Cloudflare DNS: add the record Railway asks for (usually a `CNAME` to the
   Railway target). Set **SSL/TLS mode to Full (strict)**.
3. Set `APP_URL=https://swimthe4lights.org` so email links use the real domain.

The app trusts the proxy (`trust proxy`) so secure cookies work behind
Cloudflare + Railway.

## Security & privacy notes
Passwords are bcrypt-hashed; sessions are httpOnly/secure cookies stored in
Postgres; all forms are CSRF-protected; SQL is parameterized; uploads are type/
size validated and served only via access-controlled routes. This stores real
personal data and identity/accreditation documents — put a privacy policy and a
retention stance in place before public launch.
