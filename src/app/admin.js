/* Admin routes: dashboard, swimmer review, accreditation, series completion. */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { query, one } = require("./db.js");
const { rebuild } = require("./rebuild.js");
const { ensureEntries, SWIM_SLUGS } = require("./migrate.js");
const { SWIMS } = require("../content/swims.js");
const { shortName } = require("../templates/layout.js");
const { verifyCsrf } = require("./csrf.js");
const { requireAdmin, setFlash, takeFlash } = require("./middleware.js");
const { UPLOAD_DIR } = require("./uploads.js");
const content = require("./content.js");
const views = require("./views.js");
const mail = require("./mail.js");

const router = express.Router();
const SWIM_BY_SLUG = Object.fromEntries(SWIMS.map((s) => [s.slug, s]));
const swimName = (slug) => shortName(SWIM_BY_SLUG[slug]);
const num = (v) => Number(v) || 0;

// Store an override, or drop it when the value matches the file default so the
// field keeps tracking the source content.
async function putOverride(fieldPath, value, userId) {
  if (JSON.stringify(value) === JSON.stringify(content.defaultValue(fieldPath))) {
    await query("DELETE FROM content_overrides WHERE path = $1", [fieldPath]);
    return;
  }
  await query(
    `INSERT INTO content_overrides (path, value, updated_by) VALUES ($1, $2::jsonb, $3)
     ON CONFLICT (path) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    [fieldPath, JSON.stringify(value), userId]
  );
}

// Saving a whole list clears any per-item overrides beneath it.
function clearChildren(fieldPath) {
  return query("DELETE FROM content_overrides WHERE path LIKE $1", [fieldPath + ".%"]);
}

function fieldsFor(kind, id) {
  if (kind === "site") {
    const g = content.SITE_GROUPS.find((x) => x.id === id);
    return g ? { fields: g.fields, title: g.title } : null;
  }
  if (kind === "swim" && SWIM_SLUGS.includes(id)) {
    return { fields: content.swimFields(id), title: shortName(SWIM_BY_SLUG[id]) };
  }
  return null;
}

// JSON API: answer with a status code, never a redirect to the login page.
router.use("/admin/api", (req, res, next) => {
  if (!req.user) return res.status(401).json({ ok: false, error: "Not signed in." });
  if (req.user.role !== "admin") return res.status(403).json({ ok: false, error: "Forbidden." });
  next();
});

// Gate only the admin paths (not every request passing through this router).
router.use("/admin", requireAdmin);

// dashboard
router.get("/admin", async (req, res) => {
  const [{ rows: sw }, { rows: acc }, { rows: held }, { rows: swimmers }, { rows: pending }] =
    await Promise.all([
      query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'swimmer'"),
      query("SELECT COUNT(*)::int AS n FROM swim_entries WHERE status = 'accredited'"),
      query("SELECT COUNT(*)::int AS n FROM users WHERE series_completed = TRUE"),
      query(
        `SELECT u.*, (SELECT COUNT(*)::int FROM swim_entries e WHERE e.user_id = u.id AND e.status='accredited') AS accredited_count
         FROM users u WHERE u.role = 'swimmer' ORDER BY u.created_at DESC LIMIT 200`
      ),
      query(
        `SELECT e.id AS entry_id, e.user_id, e.swim_slug, e.status, e.swim_date,
                u.full_name, u.email,
                COUNT(d.id) FILTER (WHERE d.kind='accreditation')::int AS doc_count,
                MAX(d.created_at) AS last_upload
         FROM swim_entries e
         JOIN users u ON u.id = e.user_id
         LEFT JOIN documents d ON d.entry_id = e.id
         WHERE e.status <> 'accredited'
         GROUP BY e.id, u.id
         HAVING COUNT(d.id) FILTER (WHERE d.kind='accreditation') > 0
         ORDER BY MAX(d.created_at) DESC`
      ),
    ]);

  const stats = { swimmers: sw[0].n, accredited: acc[0].n, pending: pending.length, held: held[0].n };
  const swimmersV = swimmers.map((s) => ({ ...s, accredited_count: num(s.accredited_count) }));
  const pendingV = pending.map((p) => ({ ...p, doc_count: num(p.doc_count) }));
  res.send(views.renderAdmin({ user: req.user, flash: takeFlash(req), stats, swimmers: swimmersV, pending: pendingV }));
});

// ---- content editor -------------------------------------------------------

router.get("/admin/content", (req, res) => {
  res.send(
    views.renderContentIndex({ user: req.user, flash: takeFlash(req), groups: content.SITE_GROUPS, swims: SWIMS })
  );
});

router.get("/admin/content/:kind/:id", async (req, res) => {
  const spec = fieldsFor(req.params.kind, req.params.id);
  if (!spec) return res.status(404).send("Unknown content section.");
  const { rows } = await query("SELECT path, value FROM content_overrides");
  const { valueForPath, overridden } = content.resolveValues(rows);
  const values = {};
  for (const f of spec.fields) values[f.path] = content.valueToText(f, valueForPath(f.path));
  res.send(
    views.renderContentEditor({
      user: req.user,
      csrf: req.session.csrf,
      flash: takeFlash(req),
      kind: req.params.kind,
      id: req.params.id,
      title: spec.title,
      fields: spec.fields,
      values,
      overridden,
    })
  );
});

router.post("/admin/content/save", verifyCsrf, async (req, res) => {
  const { kind, id } = req.body;
  const spec = fieldsFor(kind, id);
  if (!spec) return res.status(400).send("Unknown content section.");
  for (const f of spec.fields) {
    if (req.body[f.path] === undefined) continue;
    const value = content.textToValue(f, req.body[f.path]);
    await putOverride(f.path, value, req.user.id);
    if (f.type === "list") await clearChildren(f.path);
  }
  const r = await rebuild();
  setFlash(req, r.code === 0 ? "success" : "error", r.code === 0 ? "Changes published." : "Saved, but rebuild failed: " + r.err);
  res.redirect(`/admin/content/${kind}/${id}`);
});

router.post("/admin/content/reset", verifyCsrf, async (req, res) => {
  const { kind, id, path: fieldPath } = req.body;
  if (content.FIELD_BY_PATH[fieldPath]) {
    await query("DELETE FROM content_overrides WHERE path = $1", [fieldPath]);
    await clearChildren(fieldPath);
    await rebuild();
    setFlash(req, "info", "Reverted to the original text.");
  }
  const dest = fieldsFor(kind, id) ? `/admin/content/${kind}/${id}` : "/admin/content";
  res.redirect(dest);
});

// ---- inline editing API ---------------------------------------------------
//
// Called by the in-page editor (assets/js/edit.js) as the admin edits text on
// the live marketing pages. One field per request; the static HTML is
// regenerated after each save (rebuilds are coalesced).

router.post("/admin/api/content", verifyCsrf, async (req, res) => {
  const fieldPath = String((req.body && req.body.path) || "");
  const raw = (req.body && req.body.value) != null ? String(req.body.value) : "";

  if (!content.isInlineEditable(fieldPath)) {
    return res.status(400).json({ ok: false, error: "That field can't be edited here." });
  }
  // Inline edits are single-line plain text.
  const value = raw.replace(/\s+/g, " ").trim();
  if (!value) {
    return res.status(400).json({ ok: false, error: "Text can't be empty." });
  }
  if (value.length > 5000) {
    return res.status(400).json({ ok: false, error: "That text is too long." });
  }

  try {
    await putOverride(fieldPath, value, req.user.id);
    const r = await rebuild();
    if (r.code !== 0) return res.status(500).json({ ok: false, error: "Saved, but the rebuild failed." });
    const isDefault = value === content.defaultValue(fieldPath);
    res.json({ ok: true, value, isDefault });
  } catch (err) {
    console.error("[inline-edit]", err.message);
    res.status(500).json({ ok: false, error: "Could not save that change." });
  }
});

// Revert one field to its original text.
router.post("/admin/api/content/reset", verifyCsrf, async (req, res) => {
  const fieldPath = String((req.body && req.body.path) || "");
  if (!content.isInlineEditable(fieldPath)) {
    return res.status(400).json({ ok: false, error: "Unknown field." });
  }
  try {
    await query("DELETE FROM content_overrides WHERE path = $1", [fieldPath]);
    await rebuild();
    res.json({ ok: true, value: content.defaultValue(fieldPath), isDefault: true });
  } catch (err) {
    console.error("[inline-edit reset]", err.message);
    res.status(500).json({ ok: false, error: "Could not reset that field." });
  }
});

// Which fields on this page currently differ from the file defaults.
router.get("/admin/api/content/state", async (req, res) => {
  try {
    const { rows } = await query("SELECT path FROM content_overrides");
    res.json({ ok: true, overridden: rows.map((r) => r.path) });
  } catch (err) {
    res.json({ ok: true, overridden: [] });
  }
});

// swimmer detail
router.get("/admin/swimmer/:id", async (req, res) => {
  const swimmer = await one("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!swimmer) return res.status(404).send("Swimmer not found.");
  const entries = await ensureEntries(swimmer.id);
  const { rows: docs } = await query(
    "SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
    [swimmer.id]
  );
  const docsByEntry = {};
  for (const d of docs) (docsByEntry[d.entry_id] = docsByEntry[d.entry_id] || []).push(d);
  const { rows: events } = await query(
    `SELECT ev.* FROM entry_events ev JOIN swim_entries e ON e.id = ev.entry_id
     WHERE e.user_id = $1 ORDER BY ev.created_at DESC LIMIT 50`,
    [swimmer.id]
  );
  res.send(
    views.renderAdminSwimmer({
      user: req.user,
      csrf: req.session.csrf,
      flash: takeFlash(req),
      swimmer,
      entries,
      docsByEntry,
      events,
    })
  );
});

async function loadEntryAndUser(entryId) {
  const entry = await one("SELECT * FROM swim_entries WHERE id = $1", [entryId]);
  if (!entry) return {};
  const swimmer = await one("SELECT * FROM users WHERE id = $1", [entry.user_id]);
  return { entry, swimmer };
}

async function recomputeSeries(userId) {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS n FROM swim_entries WHERE user_id = $1 AND status = 'accredited'",
    [userId]
  );
  if (rows[0].n < SWIMS.length) {
    await query(
      "UPDATE users SET series_completed = FALSE, series_completed_at = NULL WHERE id = $1 AND series_completed = TRUE",
      [userId]
    );
  }
}

// set status (any of the four)
router.post("/admin/entry/:id/status", verifyCsrf, async (req, res) => {
  const { entry, swimmer } = await loadEntryAndUser(req.params.id);
  if (!entry) return res.status(404).send("Entry not found.");
  const status = String(req.body.status || "");
  if (!["aspiring", "organised", "completed", "accredited"].includes(status)) {
    setFlash(req, "error", "Invalid status.");
    return res.redirect(`/admin/swimmer/${entry.user_id}`);
  }
  const wasAccredited = entry.status === "accredited";
  await query("UPDATE swim_entries SET status = $1, updated_at = now() WHERE id = $2", [status, entry.id]);
  await query("INSERT INTO entry_events (entry_id, actor_user_id, type, note) VALUES ($1,$2,'admin_status',$3)", [
    entry.id,
    req.user.id,
    `Admin set status to ${status}`,
  ]);
  if (status === "accredited" && !wasAccredited) mail.sendAccreditationDecision(swimmer, swimName(entry.swim_slug), true);
  await recomputeSeries(entry.user_id);
  setFlash(req, "success", `Status set to ${status}.`);
  res.redirect(`/admin/swimmer/${entry.user_id}`);
});

// accredit / revoke
router.post("/admin/entry/:id/accredit", verifyCsrf, async (req, res) => {
  const { entry, swimmer } = await loadEntryAndUser(req.params.id);
  if (!entry) return res.status(404).send("Entry not found.");
  const decision = req.body.decision === "revoke" ? "revoke" : "accredit";
  if (decision === "accredit") {
    await query("UPDATE swim_entries SET status = 'accredited', updated_at = now() WHERE id = $1", [entry.id]);
    await query("INSERT INTO entry_events (entry_id, actor_user_id, type, note) VALUES ($1,$2,'accredited','Admin accredited crossing')", [
      entry.id,
      req.user.id,
    ]);
    mail.sendAccreditationDecision(swimmer, swimName(entry.swim_slug), true);
    setFlash(req, "success", `${swimName(entry.swim_slug)} accredited.`);
  } else {
    await query("UPDATE swim_entries SET status = 'completed', updated_at = now() WHERE id = $1", [entry.id]);
    await query("INSERT INTO entry_events (entry_id, actor_user_id, type, note) VALUES ($1,$2,'revoked','Admin revoked accreditation')", [
      entry.id,
      req.user.id,
    ]);
    await recomputeSeries(entry.user_id);
    setFlash(req, "info", `${swimName(entry.swim_slug)} accreditation revoked.`);
  }
  res.redirect(`/admin/swimmer/${entry.user_id}`);
});

// mark / unmark completed series
router.post("/admin/swimmer/:id/series", verifyCsrf, async (req, res) => {
  const swimmer = await one("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!swimmer) return res.status(404).send("Swimmer not found.");
  const value = req.body.value === "1";
  if (value) {
    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM swim_entries WHERE user_id = $1 AND status = 'accredited'",
      [swimmer.id]
    );
    if (rows[0].n < SWIMS.length) {
      setFlash(req, "error", "All four crossings must be accredited first.");
      return res.redirect(`/admin/swimmer/${swimmer.id}`);
    }
    await query(
      "UPDATE users SET series_completed = TRUE, series_completed_at = now(), updated_at = now() WHERE id = $1",
      [swimmer.id]
    );
    mail.sendSeriesCompleted(swimmer);
    setFlash(req, "success", "Marked as Completed the Four Lights.");
  } else {
    await query(
      "UPDATE users SET series_completed = FALSE, series_completed_at = NULL, updated_at = now() WHERE id = $1",
      [swimmer.id]
    );
    setFlash(req, "info", "Series completion removed.");
  }
  res.redirect(`/admin/swimmer/${swimmer.id}`);
});

// document view (admin can view any)
router.get("/admin/document/:id", async (req, res) => {
  const doc = await one("SELECT * FROM documents WHERE id = $1", [req.params.id]);
  if (!doc) return res.status(404).send("Not found.");
  const filePath = path.resolve(UPLOAD_DIR, doc.stored_name);
  if (!filePath.startsWith(path.resolve(UPLOAD_DIR)) || !fs.existsSync(filePath))
    return res.status(404).send("File missing.");
  res.setHeader("Content-Type", doc.mime_type);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(doc.original_name)}"`);
  res.sendFile(filePath);
});

module.exports = router;
