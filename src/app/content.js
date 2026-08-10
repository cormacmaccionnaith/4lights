/*
 * Editable-content model. The marketing copy in src/content/*.js is the
 * default; admins can override individual fields, stored in the
 * content_overrides table (path -> JSON value). The build layers overrides
 * over the defaults when it renders, so edits persist across redeploys.
 *
 * Only prose fields are editable here (not structure like slugs, lighthouse
 * names, provinces or map coordinates).
 */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");

// ---- path helpers ---------------------------------------------------------

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setByPath(obj, dotted, value) {
  const keys = dotted.split(".");
  const last = keys.pop();
  let t = obj;
  for (const k of keys) {
    if (t[k] == null || typeof t[k] !== "object") t[k] = {};
    t = t[k];
  }
  t[last] = value;
}

// Apply DB override rows ({path, value}) onto site/swims objects (mutates).
// Paths: "site.<...>" or "swim.<slug>.<...>".
function applyOverrides(site, swims, rows) {
  for (const { path, value } of rows || []) {
    const parts = path.split(".");
    if (parts[0] === "site") {
      setByPath(site, parts.slice(1).join("."), value);
    } else if (parts[0] === "swim") {
      const swim = swims.find((s) => s.slug === parts[1]);
      if (swim) setByPath(swim, parts.slice(2).join("."), value);
    }
  }
}

// ---- editable field schema ------------------------------------------------

const SITE_GROUPS = [
  {
    id: "home",
    title: "Homepage",
    fields: [
      { path: "site.tagline", label: "Tagline", type: "text" },
      { path: "site.hero.heading", label: "Hero heading", type: "text" },
      { path: "site.hero.sub", label: "Hero subtitle", type: "multiline" },
      { path: "site.idea.lead", label: "The idea — lead", type: "text" },
      { path: "site.idea.body", label: "The idea — paragraphs", type: "list" },
      { path: "site.symmetry.lead", label: "The symmetry — lead", type: "text" },
      { path: "site.symmetry.body", label: "The symmetry — paragraphs", type: "list" },
      { path: "site.challenge.lead", label: "The challenge — lead", type: "text" },
      { path: "site.cta.body", label: "Closing call-to-action", type: "text" },
    ],
  },
  {
    id: "rules",
    title: "Rules & safety",
    fields: [
      { path: "site.rules.lead", label: "Rules — lead", type: "text" },
      { path: "site.rules.intro", label: "Rules — intro paragraphs", type: "list" },
      { path: "site.rules.certification.body", label: "Certification — paragraphs", type: "list" },
      { path: "site.rules.safety.body", label: "Safety & logistics — paragraphs", type: "list" },
      { path: "site.rules.pilots.body", label: "Pilots — text", type: "text" },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    fields: [
      { path: "site.contact.lead", label: "Contact — lead", type: "text" },
      { path: "site.contact.body", label: "Contact — paragraphs", type: "list" },
    ],
  },
];

function swimFields(slug) {
  return [
    { path: `swim.${slug}.epithet`, label: "Evocative one-liner", type: "text" },
    { path: `swim.${slug}.distance`, label: "Distance", type: "text" },
    { path: `swim.${slug}.built`, label: "Provenance line", type: "text" },
    { path: `swim.${slug}.story`, label: "The story — paragraphs", type: "list" },
    { path: `swim.${slug}.crossing`, label: "The crossing — paragraphs", type: "list" },
  ];
}

const FIELD_BY_PATH = {};
for (const g of SITE_GROUPS) for (const f of g.fields) FIELD_BY_PATH[f.path] = f;
for (const s of SWIMS) for (const f of swimFields(s.slug)) FIELD_BY_PATH[f.path] = f;

// ---- value <-> textarea conversions ---------------------------------------

// list fields edit as one textarea; paragraphs separated by a blank line.
function valueToText(field, value) {
  if (value == null) return "";
  if (field.type === "list") return (Array.isArray(value) ? value : [value]).join("\n\n");
  return String(value);
}
function textToValue(field, text) {
  const t = String(text == null ? "" : text).replace(/\r\n/g, "\n");
  if (field.type === "list") {
    return t
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return t.trim();
}

// ---- resolution (defaults + overrides), non-mutating ----------------------

function cloneDefaults() {
  return {
    site: JSON.parse(JSON.stringify(SITE)),
    swims: JSON.parse(JSON.stringify(SWIMS)),
  };
}

// The pristine default value for a path (SITE/SWIMS are never mutated in the
// server process; only the build process applies overrides).
function defaultValue(path) {
  const parts = path.split(".");
  if (parts[0] === "site") return getByPath(SITE, parts.slice(1).join("."));
  if (parts[0] === "swim") {
    const s = SWIMS.find((x) => x.slug === parts[1]);
    return s ? getByPath(s, parts.slice(2).join(".")) : undefined;
  }
}

// Resolve current values for display in the editor. `rows` = override rows.
function resolveValues(rows) {
  const { site, swims } = cloneDefaults();
  applyOverrides(site, swims, rows);
  const overridden = new Set((rows || []).map((r) => r.path));
  const valueForPath = (path) => {
    const parts = path.split(".");
    if (parts[0] === "site") return getByPath(site, parts.slice(1).join("."));
    if (parts[0] === "swim") {
      const swim = swims.find((s) => s.slug === parts[1]);
      return swim ? getByPath(swim, parts.slice(2).join(".")) : undefined;
    }
  };
  return { valueForPath, overridden };
}

module.exports = {
  SITE_GROUPS,
  swimFields,
  FIELD_BY_PATH,
  applyOverrides,
  valueToText,
  textToValue,
  resolveValues,
  defaultValue,
};
