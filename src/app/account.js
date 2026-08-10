/* Swimmer account routes: profile, per-swim status/details/documents. */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { query, one } = require("./db.js");
const { SWIM_SLUGS, ensureEntries } = require("./migrate.js");
const { SWIMS } = require("../content/swims.js");
const { shortName } = require("../templates/layout.js");
const { verifyCsrf } = require("./csrf.js");
const { requireVerified, setFlash, takeFlash } = require("./middleware.js");
const { upload, UPLOAD_DIR } = require("./uploads.js");
const { SWIMMER_STATUSES } = require("./views.js");
const views = require("./views.js");
const mail = require("./mail.js");

const router = express.Router();
const SWIM_BY_SLUG = Object.fromEntries(SWIMS.map((s) => [s.slug, s]));

// Gate only the account paths (not every request passing through this router).
router.use("/account", requireVerified);

async function getEntry(userId, slug) {
  await ensureEntries(userId);
  return one("SELECT * FROM swim_entries WHERE user_id = $1 AND swim_slug = $2", [userId, slug]);
}

// dashboard
router.get("/account", async (req, res) => {
  const entries = await ensureEntries(req.user.id);
  res.send(views.renderAccount({ user: req.user, entries, flash: takeFlash(req) }));
});

// profile
router.get("/account/profile", (req, res) => {
  res.send(views.renderProfile({ user: req.user, csrf: req.session.csrf, flash: takeFlash(req) }));
});

router.post("/account/profile", verifyCsrf, async (req, res) => {
  const b = req.body;
  const clip = (v, n) => String(v || "").trim().slice(0, n);
  await query(
    `UPDATE users SET full_name=$1, phone=$2, address_line1=$3, address_line2=$4,
       city=$5, county=$6, postcode=$7, country=$8, updated_at=now() WHERE id=$9`,
    [
      clip(b.full_name, 120),
      clip(b.phone, 40),
      clip(b.address_line1, 160),
      clip(b.address_line2, 160),
      clip(b.city, 80),
      clip(b.county, 80),
      clip(b.postcode, 20),
      clip(b.country, 80) || "Ireland",
      req.user.id,
    ]
  );
  setFlash(req, "success", "Your details were saved.");
  res.redirect("/account");
});

// swim detail
function validSlug(req, res, next) {
  if (!SWIM_SLUGS.includes(req.params.slug)) return res.status(404).send("Unknown swim.");
  next();
}

router.get("/account/swim/:slug", validSlug, async (req, res) => {
  const entry = await getEntry(req.user.id, req.params.slug);
  const { rows: docs } = await query(
    "SELECT * FROM documents WHERE entry_id = $1 ORDER BY created_at DESC",
    [entry.id]
  );
  res.send(views.renderSwim({ user: req.user, csrf: req.session.csrf, flash: takeFlash(req), entry, docs }));
});

router.post("/account/swim/:slug/status", validSlug, verifyCsrf, async (req, res) => {
  const entry = await getEntry(req.user.id, req.params.slug);
  if (entry.status === "accredited") {
    setFlash(req, "error", "This crossing is accredited and can only be changed by the admin.");
    return res.redirect(`/account/swim/${req.params.slug}`);
  }
  const status = String(req.body.status || "");
  if (!SWIMMER_STATUSES.includes(status)) {
    setFlash(req, "error", "Invalid status.");
    return res.redirect(`/account/swim/${req.params.slug}`);
  }
  await query("UPDATE swim_entries SET status=$1, updated_at=now() WHERE id=$2", [status, entry.id]);
  await query("INSERT INTO entry_events (entry_id, actor_user_id, type, note) VALUES ($1,$2,'status',$3)", [
    entry.id,
    req.user.id,
    `Swimmer set status to ${status}`,
  ]);
  setFlash(req, "success", "Status updated.");
  res.redirect(`/account/swim/${req.params.slug}`);
});

router.post("/account/swim/:slug/details", validSlug, verifyCsrf, async (req, res) => {
  const entry = await getEntry(req.user.id, req.params.slug);
  const swimDate = String(req.body.swim_date || "").trim() || null;
  const direction = String(req.body.direction || "").trim().slice(0, 200);
  const routeNote = String(req.body.route_note || "").trim().slice(0, 4000);
  await query(
    "UPDATE swim_entries SET swim_date=$1, direction=$2, route_note=$3, updated_at=now() WHERE id=$4",
    [swimDate, direction, routeNote, entry.id]
  );
  setFlash(req, "success", "Crossing details saved.");
  res.redirect(`/account/swim/${req.params.slug}`);
});

// upload — wrap multer to turn its errors into a flash
router.post("/account/swim/:slug/upload", validSlug, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      setFlash(req, "error", err.message || "Upload failed.");
      return res.redirect(`/account/swim/${req.params.slug}`);
    }
    // CSRF is checked after multer parses the multipart body
    if (!req.session || req.body._csrf !== req.session.csrf) {
      if (req.file) fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
      return res.status(403).send("Session expired. Go back and try again.");
    }
    if (!req.file) {
      setFlash(req, "error", "Please choose a file.");
      return res.redirect(`/account/swim/${req.params.slug}`);
    }
    const entry = await getEntry(req.user.id, req.params.slug);
    const kind = req.body.kind === "route" ? "route" : "accreditation";
    await query(
      `INSERT INTO documents (entry_id, user_id, stored_name, original_name, mime_type, size_bytes, kind)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [entry.id, req.user.id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, kind]
    );
    await query("INSERT INTO entry_events (entry_id, actor_user_id, type, note) VALUES ($1,$2,'upload',$3)", [
      entry.id,
      req.user.id,
      `Uploaded ${kind}: ${req.file.originalname}`,
    ]);
    if (kind === "accreditation") {
      const adminEmail = (process.env.ADMIN_EMAIL || "cormacmaccionnaith@gmail.com").toLowerCase();
      mail.sendAccreditationSubmitted(adminEmail, req.user, shortName(SWIM_BY_SLUG[req.params.slug]));
    }
    setFlash(req, "success", "File uploaded.");
    res.redirect(`/account/swim/${req.params.slug}`);
  });
});

// document download (owner only)
router.get("/account/document/:id", async (req, res) => {
  const doc = await one("SELECT * FROM documents WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  if (!doc) return res.status(404).send("Not found.");
  const filePath = path.resolve(UPLOAD_DIR, doc.stored_name);
  if (!filePath.startsWith(path.resolve(UPLOAD_DIR)) || !fs.existsSync(filePath))
    return res.status(404).send("File missing.");
  res.setHeader("Content-Type", doc.mime_type);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(doc.original_name)}"`);
  res.sendFile(filePath);
});

module.exports = router;
