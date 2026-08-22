/*
 * Server-rendered application pages. Reuses the marketing site's stylesheet
 * plus assets/css/app.css, and mirrors its header/footer so the app feels
 * of a piece with the site. Every render function is a pure function of its
 * inputs; route handlers pass in { user, csrf, flash, ...data }.
 */

const { SWIMS } = require("../content/swims.js");
const { esc, shortName } = require("../templates/layout.js");
const mark = require("../templates/mark.js");

const SWIM_BY_SLUG = Object.fromEntries(SWIMS.map((s) => [s.slug, s]));

const STATUS = {
  aspiring: { label: "Aspiring", note: "Considering the crossing" },
  organised: { label: "Organised", note: "Pilot and plan in place" },
  completed: { label: "Completed", note: "Swum — awaiting accreditation" },
  accredited: { label: "Accredited", note: "Verified and on the board" },
};
const SWIMMER_STATUSES = ["aspiring", "organised", "completed"]; // accredited is admin-only

function statusBadge(status) {
  return `<span class="badge badge--${status}">${esc(STATUS[status] ? STATUS[status].label : status)}</span>`;
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleDateString("en-IE", { year: "numeric", month: "short", day: "numeric" });
}

function fmtSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function flashHtml(flash) {
  if (!flash || !flash.msg) return "";
  return `<div class="flash flash--${esc(flash.type || "info")}">${esc(flash.msg)}</div>`;
}

function header(user, active) {
  const links = [];
  if (user) {
    links.push(`<a href="/account"${active === "account" ? ' class="is-active"' : ""}>Account</a>`);
    if (user.role === "admin")
      links.push(`<a href="/admin"${active === "admin" ? ' class="is-active"' : ""}>Admin</a>`);
    links.push(
      `<form method="post" action="/logout" class="hdr__logout"><span class="hdr__who">${esc(
        user.full_name || user.email
      )}</span><button type="submit" class="linklike">Log out</button></form>`
    );
  } else {
    links.push(`<a href="/login"${active === "login" ? ' class="is-active"' : ""}>Log in</a>`);
    links.push(`<a class="btn btn--beam btn--sm" href="/register">Create account</a>`);
  }
  return `
  <header class="site-header">
    <nav class="nav">
      <a class="nav__brand" href="/">
        <span class="nav__brandtext">
          <span class="nav__brandirish">Na Ceithre Soilse</span>
          <span class="nav__brandname">The Four Lights</span>
        </span>
      </a>
      <div class="hdr__links">${links.join("")}</div>
    </nav>
  </header>`;
}

function appLayout({ title, user, active, body, flash }) {
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} — The Four Lights</title>
  <meta name="robots" content="noindex">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/app.css">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
</head>
<body class="app">
  ${header(user, active)}
  <main class="app__main">
    <div class="app__wrap">
      ${flashHtml(flash)}
      ${body}
    </div>
  </main>
  <footer class="app__footer">
    <a href="/">← The Four Lights</a>
    <span>Na Ceithre Soilse · The Four Lights Swim Series</span>
  </footer>
</body>
</html>`;
}

// ---- auth pages -----------------------------------------------------------

function authCard(inner) {
  return `<div class="authcard">${inner}</div>`;
}

function renderLogin({ csrf, flash, email = "", next = "" }) {
  const body = authCard(`
    <h1 class="app__h">Log in</h1>
    <form method="post" action="/login" class="form">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      ${next ? `<input type="hidden" name="next" value="${esc(next)}">` : ""}
      <label>Email<input type="email" name="email" value="${esc(email)}" required autocomplete="email"></label>
      <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
      <button class="btn btn--beam" type="submit">Log in</button>
    </form>
    <p class="form__alt"><a href="/forgot">Forgot your password?</a></p>
    <p class="form__alt">New here? <a href="/register">Create an account</a></p>`);
  return appLayout({ title: "Log in", active: "login", body, flash });
}

function renderRegister({ csrf, flash, values = {} }) {
  const v = values;
  const body = authCard(`
    <h1 class="app__h">Create your account</h1>
    <p class="app__lead">Track your progress toward the Four Lights. You'll confirm your email before your account is active.</p>
    <form method="post" action="/register" class="form">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      <label>Full name<input type="text" name="full_name" value="${esc(v.full_name || "")}" required autocomplete="name"></label>
      <label>Email<input type="email" name="email" value="${esc(v.email || "")}" required autocomplete="email"></label>
      <label>Password <span class="hint">(at least 8 characters)</span><input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
      <label>Confirm password<input type="password" name="password2" required minlength="8" autocomplete="new-password"></label>
      <button class="btn btn--beam" type="submit">Create account</button>
    </form>
    <p class="form__alt">Already have an account? <a href="/login">Log in</a></p>`);
  return appLayout({ title: "Create account", active: "register", body, flash });
}

function renderForgot({ csrf, flash }) {
  const body = authCard(`
    <h1 class="app__h">Reset your password</h1>
    <p class="app__lead">Enter your email and we'll send a reset link if an account exists.</p>
    <form method="post" action="/forgot" class="form">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      <label>Email<input type="email" name="email" required autocomplete="email"></label>
      <button class="btn btn--beam" type="submit">Send reset link</button>
    </form>
    <p class="form__alt"><a href="/login">Back to log in</a></p>`);
  return appLayout({ title: "Reset password", body, flash });
}

function renderReset({ csrf, flash, token }) {
  const body = authCard(`
    <h1 class="app__h">Choose a new password</h1>
    <form method="post" action="/reset" class="form">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      <input type="hidden" name="token" value="${esc(token)}">
      <label>New password <span class="hint">(at least 8 characters)</span><input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
      <label>Confirm password<input type="password" name="password2" required minlength="8" autocomplete="new-password"></label>
      <button class="btn btn--beam" type="submit">Set password</button>
    </form>`);
  return appLayout({ title: "Set password", body, flash });
}

function renderMessage({ user, title, heading, message, flash }) {
  const body = authCard(`<h1 class="app__h">${esc(heading)}</h1><p class="app__lead">${esc(message)}</p>
    <p class="form__alt"><a href="${user ? "/account" : "/login"}">Continue</a></p>`);
  return appLayout({ title, user, body, flash });
}

// ---- swimmer dashboard ----------------------------------------------------

/*
 * A swimmer's standing, shown as the mark itself: one beam alight per
 * accredited crossing, all four (and the halo) once the series is held.
 */
function seriesBanner(user, entries, idPrefix = "you") {
  const accredited = entries.filter((e) => e.status === "accredited").length;
  const held = Boolean(user.series_completed);
  const lit = mark.badge({
    lit: accredited,
    size: 92,
    id: idPrefix,
    ring: accredited ? "beam" : "muted",
    label: held ? "Holds the Four Lights" : `${accredited} of four lights accredited`,
  });
  const names = SWIMS.map((s) => {
    const e = entries.find((x) => x.swim_slug === s.slug);
    const on = e && e.status === "accredited";
    return `<span class="series__light${on ? " is-on" : ""}">${esc(shortName(s))}</span>`;
  }).join("");

  return `<div class="series${held ? " series--held" : ""}">
    <div class="series__mark">${lit}</div>
    <div class="series__text">
      <span class="series__kicker">The Four Lights</span>
      <strong class="series__title">${
        held ? "You hold the Four Lights." : `${accredited} of 4 accredited`
      }</strong>
      <span class="series__sub">${
        held
          ? `All four crossings accredited${
              user.series_completed_at ? ` · ${fmtDate(user.series_completed_at)}` : ""
            }.`
          : "A beam lights for each crossing accredited."
      }</span>
      <div class="series__lights">${names}</div>
    </div>
  </div>`;
}

function renderAccount({ user, entries, flash }) {
  const cards = SWIMS.map((s) => {
    const e = entries.find((x) => x.swim_slug === s.slug) || { status: "aspiring" };
    return `<a class="swimtile" href="/account/swim/${s.slug}">
      <span class="swimtile__prov">${esc(s.province)}</span>
      <span class="swimtile__name">${esc(s.route)}</span>
      <span class="swimtile__row">${statusBadge(e.status)}<span class="swimtile__dist">${esc(s.distance)}</span></span>
      ${e.swim_date ? `<span class="swimtile__date">Swum ${fmtDate(e.swim_date)}</span>` : ""}
    </a>`;
  }).join("");

  const body = `
    <div class="app__head">
      <div>
        <p class="eyebrow">Your account</p>
        <h1 class="app__h">${esc(user.full_name || "Swimmer")}</h1>
      </div>
      <a class="btn btn--ghost btn--sm" href="/account/profile">Edit profile</a>
    </div>
    ${seriesBanner(user, entries)}
    <h2 class="app__h2">The four lights</h2>
    <div class="swimgrid">${cards}</div>
    <section class="profilecard">
      <h2 class="app__h2">Your details</h2>
      <dl class="kv">
        <div><dt>Email</dt><dd>${esc(user.email)}</dd></div>
        <div><dt>Phone</dt><dd>${esc(user.phone || "—")}</dd></div>
        <div><dt>Address</dt><dd>${esc(
          [user.address_line1, user.address_line2, user.city, user.county, user.postcode, user.country]
            .filter(Boolean)
            .join(", ") || "—"
        )}</dd></div>
      </dl>
    </section>`;
  return appLayout({ title: "Account", user, active: "account", body, flash });
}

function renderProfile({ user, csrf, flash }) {
  const f = (name, label, opts = {}) =>
    `<label>${esc(label)}<input type="${opts.type || "text"}" name="${name}" value="${esc(
      user[name] || ""
    )}" ${opts.attrs || ""}></label>`;
  const body = `
    <div class="app__head"><div><p class="eyebrow">Account</p><h1 class="app__h">Your details</h1></div>
      <a class="btn btn--ghost btn--sm" href="/account">Back</a></div>
    <form method="post" action="/account/profile" class="form form--wide profilecard">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      ${f("full_name", "Full name", { attrs: "autocomplete=name required" })}
      ${f("phone", "Phone", { type: "tel", attrs: "autocomplete=tel" })}
      ${f("address_line1", "Address line 1", { attrs: "autocomplete=address-line1" })}
      ${f("address_line2", "Address line 2", { attrs: "autocomplete=address-line2" })}
      <div class="form__two">${f("city", "City / town")}${f("county", "County")}</div>
      <div class="form__two">${f("postcode", "Eircode / postcode")}${f("country", "Country")}</div>
      <button class="btn btn--beam" type="submit">Save details</button>
    </form>`;
  return appLayout({ title: "Edit profile", user, active: "account", body, flash });
}

function renderSwim({ user, csrf, flash, entry, docs }) {
  const s = SWIM_BY_SLUG[entry.swim_slug];
  const locked = entry.status === "accredited";
  const statusControl = locked
    ? `<p class="lockednote">${statusBadge("accredited")} This crossing is accredited — its status is now set by the series admin.</p>`
    : `<form method="post" action="/account/swim/${entry.swim_slug}/status" class="statusform">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <div class="statusform__opts">
          ${SWIMMER_STATUSES.map(
            (st) => `<label class="statuspick${entry.status === st ? " is-on" : ""}">
            <input type="radio" name="status" value="${st}" ${entry.status === st ? "checked" : ""}>
            <span class="statuspick__label">${esc(STATUS[st].label)}</span>
            <span class="statuspick__note">${esc(STATUS[st].note)}</span>
          </label>`
          ).join("")}
        </div>
        <button class="btn btn--beam btn--sm" type="submit">Update status</button>
        <p class="hint">Accreditation is granted by the admin after reviewing your documents.</p>
      </form>`;

  const docRows = docs.length
    ? `<ul class="doclist">${docs
        .map(
          (d) => `<li>
        <a href="/account/document/${d.id}" target="_blank" rel="noopener">${esc(d.original_name)}</a>
        <span class="doclist__meta">${esc(d.kind)} · ${fmtSize(d.size_bytes)} · ${fmtDate(d.created_at)}</span>
      </li>`
        )
        .join("")}</ul>`
    : `<p class="hint">No documents uploaded yet.</p>`;

  const body = `
    <div class="app__head"><div>
      <p class="eyebrow">${esc(s.province)} · ${esc(s.distance)}</p>
      <h1 class="app__h">${esc(s.route)}</h1>
      <p class="app__lead">${esc(s.route)} · ${esc(s.water)}</p>
    </div><a class="btn btn--ghost btn--sm" href="/account">Back</a></div>

    <section class="panel">
      <h2 class="app__h2">Status</h2>
      ${statusControl}
    </section>

    <section class="panel">
      <h2 class="app__h2">Your crossing</h2>
      <form method="post" action="/account/swim/${entry.swim_slug}/details" class="form">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <div class="form__two">
          <label>Swim date<input type="date" name="swim_date" value="${
            entry.swim_date ? new Date(entry.swim_date).toISOString().slice(0, 10) : ""
          }"></label>
          <label>Direction <span class="hint">(optional)</span><input type="text" name="direction" value="${esc(
            entry.direction || ""
          )}" placeholder="e.g. ${esc(s.shore)} → ${esc(s.light)}"></label>
        </div>
        <label>Route notes<textarea name="route_note" rows="4" placeholder="Start, finish, pilot, conditions…">${esc(
          entry.route_note || ""
        )}</textarea></label>
        <button class="btn btn--beam btn--sm" type="submit">Save crossing details</button>
      </form>
    </section>

    <section class="panel">
      <h2 class="app__h2">Documents</h2>
      <p class="hint">Upload your accreditation (GPS track, pilot log, observer certificate) and any route files. PDF, PNG, JPG or WEBP, up to 15 MB each.</p>
      ${docRows}
      <form method="post" action="/account/swim/${entry.swim_slug}/upload" enctype="multipart/form-data" class="form uploadform">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <div class="form__two">
          <label>File<input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required></label>
          <label>Type<select name="kind">
            <option value="accreditation">Accreditation</option>
            <option value="route">Route</option>
          </select></label>
        </div>
        <button class="btn btn--beam btn--sm" type="submit">Upload</button>
      </form>
    </section>`;
  return appLayout({ title: shortName(s), user, active: "account", body, flash });
}

// ---- admin ----------------------------------------------------------------

function renderAdmin({ user, flash, stats, swimmers, pending }) {
  const statTiles = `
    <div class="stats">
      <div class="stat"><span class="stat__n">${stats.swimmers}</span><span class="stat__l">Swimmers</span></div>
      <div class="stat"><span class="stat__n">${stats.accredited}</span><span class="stat__l">Accredited crossings</span></div>
      <div class="stat"><span class="stat__n">${stats.pending}</span><span class="stat__l">Awaiting review</span></div>
      <div class="stat"><span class="stat__n">${stats.held}</span><span class="stat__l">Hold the Four Lights</span></div>
    </div>`;

  const pendingRows = pending.length
    ? pending
        .map(
          (p) => `<tr>
        <td><a href="/admin/swimmer/${p.user_id}">${esc(p.full_name || p.email)}</a></td>
        <td>${esc(shortName(SWIM_BY_SLUG[p.swim_slug]))}</td>
        <td>${statusBadge(p.status)}</td>
        <td>${p.doc_count} doc${p.doc_count === 1 ? "" : "s"}</td>
        <td>${fmtDate(p.swim_date)}</td>
        <td><a class="btn btn--ghost btn--xs" href="/admin/swimmer/${p.user_id}">Review</a></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="hint">Nothing awaiting review.</td></tr>`;

  const swimmerRows = swimmers.length
    ? swimmers
        .map(
          (sw) => `<tr>
        <td><a href="/admin/swimmer/${sw.id}">${esc(sw.full_name || "—")}</a></td>
        <td>${esc(sw.email)}${sw.email_verified ? "" : ' <span class="tag">unverified</span>'}</td>
        <td>${sw.accredited_count}/4</td>
        <td>${sw.series_completed ? '<span class="badge badge--accredited">Four Lights</span>' : "—"}</td>
        <td>${fmtDate(sw.created_at)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="hint">No swimmers yet.</td></tr>`;

  const body = `
    <div class="app__head"><div><p class="eyebrow">Admin</p><h1 class="app__h">Dashboard</h1></div>
      <a class="btn btn--ghost btn--sm" href="/admin/content">Edit site content</a></div>
    ${statTiles}
    <section class="panel">
      <h2 class="app__h2">Awaiting review</h2>
      <div class="tablewrap"><table class="table">
        <thead><tr><th>Swimmer</th><th>Swim</th><th>Status</th><th>Docs</th><th>Date</th><th></th></tr></thead>
        <tbody>${pendingRows}</tbody>
      </table></div>
    </section>
    <section class="panel">
      <h2 class="app__h2">All swimmers</h2>
      <div class="tablewrap"><table class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Accredited</th><th>Series</th><th>Joined</th></tr></thead>
        <tbody>${swimmerRows}</tbody>
      </table></div>
    </section>`;
  return appLayout({ title: "Admin", user, active: "admin", body, flash });
}

function renderAdminSwimmer({ user, csrf, flash, swimmer, entries, docsByEntry, events }) {
  const accreditedCount = entries.filter((e) => e.status === "accredited").length;
  const allAccredited = accreditedCount === SWIMS.length;

  const entryPanels = SWIMS.map((s) => {
    const e = entries.find((x) => x.swim_slug === s.slug);
    if (!e) return "";
    const docs = docsByEntry[e.id] || [];
    const docList = docs.length
      ? `<ul class="doclist">${docs
          .map(
            (d) =>
              `<li><a href="/admin/document/${d.id}" target="_blank" rel="noopener">${esc(
                d.original_name
              )}</a><span class="doclist__meta">${esc(d.kind)} · ${fmtSize(d.size_bytes)}</span></li>`
          )
          .join("")}</ul>`
      : `<p class="hint">No documents.</p>`;
    return `<div class="adminentry">
      <div class="adminentry__head">
        <strong>${esc(shortName(s))}</strong> <span class="hint">${esc(s.province)}</span>
        ${statusBadge(e.status)}
      </div>
      <p class="hint">${e.swim_date ? "Swum " + fmtDate(e.swim_date) : "No date"} ${
      e.direction ? "· " + esc(e.direction) : ""
    }</p>
      ${e.route_note ? `<p class="adminentry__note">${esc(e.route_note)}</p>` : ""}
      ${docList}
      <form method="post" action="/admin/entry/${e.id}/status" class="adminentry__actions">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <select name="status">
          ${["aspiring", "organised", "completed", "accredited"]
            .map((st) => `<option value="${st}" ${e.status === st ? "selected" : ""}>${esc(STATUS[st].label)}</option>`)
            .join("")}
        </select>
        <button class="btn btn--ghost btn--xs" type="submit">Set status</button>
      </form>
      <div class="adminentry__quick">
        ${
          e.status !== "accredited"
            ? `<form method="post" action="/admin/entry/${e.id}/accredit"><input type="hidden" name="_csrf" value="${esc(
                csrf
              )}"><input type="hidden" name="decision" value="accredit"><button class="btn btn--beam btn--xs" type="submit">Accredit ✓</button></form>`
            : `<form method="post" action="/admin/entry/${e.id}/accredit"><input type="hidden" name="_csrf" value="${esc(
                csrf
              )}"><input type="hidden" name="decision" value="revoke"><button class="btn btn--ghost btn--xs" type="submit">Revoke</button></form>`
        }
      </div>
    </div>`;
  }).join("");

  const eventRows = events.length
    ? `<ul class="events">${events
        .map(
          (ev) =>
            `<li><span class="events__t">${fmtDate(ev.created_at)}</span> ${esc(ev.type)}${
              ev.note ? " — " + esc(ev.note) : ""
            }</li>`
        )
        .join("")}</ul>`
    : `<p class="hint">No activity yet.</p>`;

  const body = `
    <div class="app__head"><div><p class="eyebrow">Admin · Swimmer</p><h1 class="app__h">${esc(
      swimmer.full_name || swimmer.email
    )}</h1></div><a class="btn btn--ghost btn--sm" href="/admin">Back</a></div>

    <section class="profilecard">
      <dl class="kv">
        <div><dt>Email</dt><dd>${esc(swimmer.email)}${
    swimmer.email_verified ? "" : ' <span class="tag">unverified</span>'
  }</dd></div>
        <div><dt>Phone</dt><dd>${esc(swimmer.phone || "—")}</dd></div>
        <div><dt>Address</dt><dd>${esc(
          [
            swimmer.address_line1,
            swimmer.address_line2,
            swimmer.city,
            swimmer.county,
            swimmer.postcode,
            swimmer.country,
          ]
            .filter(Boolean)
            .join(", ") || "—"
        )}</dd></div>
      </dl>
    </section>

    <section class="series ${swimmer.series_completed ? "series--held" : ""}">
      <div class="series__mark">${mark.badge({
        lit: accreditedCount,
        size: 74,
        id: "adm",
        ring: accreditedCount ? "beam" : "muted",
        label: `${accreditedCount} of four lights accredited`,
      })}</div>
      <div class="series__text">
        <span class="series__kicker">The Four Lights</span>
        <strong class="series__title">${accreditedCount} of 4 accredited${
    swimmer.series_completed ? " · Series held" : ""
  }</strong>
      </div>
      <form method="post" action="/admin/swimmer/${swimmer.id}/series">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <input type="hidden" name="value" value="${swimmer.series_completed ? "0" : "1"}">
        <button class="btn ${swimmer.series_completed ? "btn--ghost" : "btn--beam"} btn--sm" type="submit" ${
    !allAccredited && !swimmer.series_completed ? "disabled title='All four must be accredited first'" : ""
  }>${swimmer.series_completed ? "Unmark series" : "Mark Completed Series"}</button>
      </form>
    </section>

    <h2 class="app__h2">Crossings</h2>
    <div class="adminentries">${entryPanels}</div>

    <section class="panel">
      <h2 class="app__h2">Activity</h2>
      ${eventRows}
    </section>`;
  return appLayout({ title: swimmer.full_name || "Swimmer", user, active: "admin", body, flash });
}

// ---- content editor -------------------------------------------------------

function renderContentIndex({ user, flash, groups, swims }) {
  const siteCards = groups
    .map(
      (g) =>
        `<a class="swimtile" href="/admin/content/site/${g.id}"><span class="swimtile__prov">Site</span><span class="swimtile__name">${esc(
          g.title
        )}</span></a>`
    )
    .join("");
  const swimCards = swims
    .map(
      (s) =>
        `<a class="swimtile" href="/admin/content/swim/${s.slug}"><span class="swimtile__prov">${esc(
          s.province
        )}</span><span class="swimtile__name">${esc(s.route)}</span></a>`
    )
    .join("");
  const body = `
    <div class="app__head"><div><p class="eyebrow">Admin · Content</p><h1 class="app__h">Edit site content</h1>
      <p class="app__lead">Edit the marketing copy. Changes publish immediately and persist. Each field can be reverted to its original text.</p></div>
      <a class="btn btn--ghost btn--sm" href="/admin">Back</a></div>
    <h2 class="app__h2">Pages</h2>
    <div class="swimgrid">${siteCards}</div>
    <h2 class="app__h2">The four swims</h2>
    <div class="swimgrid">${swimCards}</div>`;
  return appLayout({ title: "Edit content", user, active: "admin", body, flash });
}

function renderContentEditor({ user, csrf, flash, kind, id, title, fields, values, overridden }) {
  const rows = fields
    .map((f) => {
      const isList = f.type === "list";
      const rows = isList ? 7 : f.type === "multiline" ? 3 : 2;
      const edited = overridden.has(f.path);
      return `<div class="cfield">
        <label for="cf_${esc(f.path)}">${esc(f.label)}${edited ? ' <span class="tag tag--edited">edited</span>' : ""}</label>
        ${isList ? '<p class="hint">One paragraph per block, separated by a blank line.</p>' : ""}
        <textarea id="cf_${esc(f.path)}" name="${esc(f.path)}" rows="${rows}">${esc(values[f.path] || "")}</textarea>
        ${
          edited
            ? `<button class="linklike cfield__reset" type="submit" formaction="/admin/content/reset" name="path" value="${esc(
                f.path
              )}">Reset to original</button>`
            : ""
        }
      </div>`;
    })
    .join("");
  const body = `
    <div class="app__head"><div><p class="eyebrow">Admin · Content</p><h1 class="app__h">${esc(title)}</h1></div>
      <a class="btn btn--ghost btn--sm" href="/admin/content">Back</a></div>
    <form method="post" action="/admin/content/save" class="form profilecard">
      <input type="hidden" name="_csrf" value="${esc(csrf)}">
      <input type="hidden" name="kind" value="${esc(kind)}">
      <input type="hidden" name="id" value="${esc(id)}">
      ${rows}
      <button class="btn btn--beam" type="submit">Publish changes</button>
    </form>`;
  return appLayout({ title, user, active: "admin", body, flash });
}

module.exports = {
  appLayout,
  renderContentIndex,
  renderContentEditor,
  renderLogin,
  renderRegister,
  renderForgot,
  renderReset,
  renderMessage,
  renderAccount,
  renderProfile,
  renderSwim,
  renderAdmin,
  renderAdminSwimmer,
  STATUS,
  SWIMMER_STATUSES,
};
