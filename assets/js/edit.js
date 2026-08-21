/*
 * Inline content editing for admins.
 *
 * Injected into the static marketing pages by the server when a logged-in
 * admin requests them. Every element the templates marked with data-ed
 * becomes click-to-edit; changes save on blur, the site is rebuilt, and the
 * new text is what every visitor sees.
 *
 * Never loaded for visitors, and every save is re-checked server-side.
 */
(function () {
  "use strict";

  var CFG = window.__T4L_EDIT__ || {};
  var CSRF = CFG.csrf || "";
  var STORE_KEY = "t4l.inline-edit";
  var nodes = [].slice.call(document.querySelectorAll("[data-ed]"));
  if (!nodes.length) return;

  var editing = false;
  var focused = null;
  var statusTimer = null;

  // ---- toolbar ------------------------------------------------------------

  var bar = document.createElement("div");
  bar.className = "t4l-bar";
  bar.innerHTML =
    '<span class="t4l-bar__dot"></span>' +
    '<span class="t4l-bar__label">Inline editing</span>' +
    '<button type="button" class="t4l-bar__toggle" aria-pressed="false">Off</button>' +
    '<span class="t4l-bar__status" role="status" aria-live="polite"></span>' +
    '<button type="button" class="t4l-bar__revert" hidden>Revert field</button>' +
    '<span class="t4l-bar__sep t4l-bar__hide-sm"></span>' +
    '<a class="t4l-bar__hide-sm" href="/admin/content">Content editor</a>' +
    '<a class="t4l-bar__hide-sm" href="/admin">Admin</a>';
  document.body.appendChild(bar);

  var toggleBtn = bar.querySelector(".t4l-bar__toggle");
  var statusEl = bar.querySelector(".t4l-bar__status");
  var revertBtn = bar.querySelector(".t4l-bar__revert");

  function status(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "t4l-bar__status" + (kind ? " is-" + kind : "");
    clearTimeout(statusTimer);
    if (kind === "ok" || kind === "err") {
      statusTimer = setTimeout(function () {
        statusEl.textContent = "";
        statusEl.className = "t4l-bar__status";
      }, 2600);
    }
  }

  // ---- helpers ------------------------------------------------------------

  function clean(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }

  function markEdited(el, isEdited) {
    el.classList.toggle("t4l-edited", !!isEdited);
  }

  // Keep any other copies of the same field on this page in step.
  function syncPath(path, value, except) {
    nodes.forEach(function (n) {
      if (n !== except && n.dataset.ed === path) {
        n.textContent = value;
        n.__orig = value;
      }
    });
  }

  function post(url, body) {
    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-csrf-token": CSRF },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().catch(function () {
        return { ok: false, error: "Server error." };
      });
    });
  }

  // ---- saving -------------------------------------------------------------

  function save(el) {
    var path = el.dataset.ed;
    var value = clean(el.textContent);
    var original = el.__orig;

    if (value === clean(original)) {
      el.textContent = original; // normalise whitespace back
      return;
    }
    if (!value) {
      el.textContent = original;
      status("Text can’t be empty", "err");
      return;
    }

    status("Saving…", "busy");
    post("/admin/api/content", { path: path, value: value }).then(function (d) {
      if (!d.ok) {
        el.textContent = original;
        status(d.error || "Save failed", "err");
        return;
      }
      el.textContent = d.value;
      el.__orig = d.value;
      markEdited(el, !d.isDefault);
      syncPath(path, d.value, el);
      if (focused === el) revertBtn.hidden = !!d.isDefault;
      status("Saved", "ok");
    });
  }

  function revert(el) {
    status("Reverting…", "busy");
    post("/admin/api/content/reset", { path: el.dataset.ed }).then(function (d) {
      if (!d.ok) return status(d.error || "Could not revert", "err");
      el.textContent = d.value;
      el.__orig = d.value;
      markEdited(el, false);
      syncPath(el.dataset.ed, d.value, el);
      revertBtn.hidden = true;
      status("Reverted", "ok");
    });
  }

  // ---- per-field wiring ---------------------------------------------------

  nodes.forEach(function (el) {
    el.__orig = el.textContent;

    el.addEventListener("focus", function () {
      focused = el;
      el.__orig = el.textContent;
      revertBtn.hidden = !el.classList.contains("t4l-edited");
    });

    el.addEventListener("blur", function () {
      if (!editing) return;
      save(el);
    });

    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        el.textContent = el.__orig;
        el.blur();
      }
    });

    // Paste as plain text so no markup can get in.
    el.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = clean((e.clipboardData || window.clipboardData).getData("text"));
      document.execCommand("insertText", false, text);
    });
  });

  // Editable text inside links: don't follow the link while editing.
  document.addEventListener(
    "click",
    function (e) {
      if (!editing) return;
      var t = e.target.closest && e.target.closest("[data-ed]");
      if (t) {
        var link = e.target.closest("a[href]");
        if (link) e.preventDefault();
      }
    },
    true
  );

  // ---- mode ---------------------------------------------------------------

  function setEditing(on) {
    editing = !!on;
    document.documentElement.classList.toggle("t4l-editing", editing);
    bar.classList.toggle("is-off", !editing);
    toggleBtn.textContent = editing ? "On" : "Off";
    toggleBtn.setAttribute("aria-pressed", editing ? "true" : "false");
    if (!editing) revertBtn.hidden = true;

    nodes.forEach(function (el) {
      if (editing) {
        // plaintext-only keeps markup out; fall back where unsupported.
        el.setAttribute("contenteditable", "plaintext-only");
        if (el.contentEditable !== "plaintext-only") el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "true");
        var link = el.closest("a[href]");
        if (link) link.setAttribute("draggable", "false");
      } else {
        el.removeAttribute("contenteditable");
        el.removeAttribute("spellcheck");
      }
    });

    try {
      localStorage.setItem(STORE_KEY, editing ? "1" : "0");
    } catch (_) {}
    status(editing ? "Click any text to edit" : "", editing ? "" : "");
  }

  toggleBtn.addEventListener("click", function () {
    setEditing(!editing);
  });

  revertBtn.addEventListener("mousedown", function (e) {
    e.preventDefault(); // keep focus so we know which field to revert
  });
  revertBtn.addEventListener("click", function () {
    if (focused) revert(focused);
  });

  // Which fields currently differ from the original copy.
  fetch("/admin/api/content/state", { credentials: "same-origin" })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      if (!d || !d.ok) return;
      var set = {};
      d.overridden.forEach(function (p) {
        set[p] = true;
      });
      nodes.forEach(function (el) {
        markEdited(el, !!set[el.dataset.ed]);
      });
    })
    .catch(function () {});

  var saved = "0";
  try {
    saved = localStorage.getItem(STORE_KEY) || "0";
  } catch (_) {}
  setEditing(saved === "1");
})();
