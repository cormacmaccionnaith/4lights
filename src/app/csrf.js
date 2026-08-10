/* Session-based CSRF: a per-session token embedded in every form and checked
   on every state-changing POST. */

const crypto = require("crypto");

function csrfToken(req) {
  if (!req.session) return "";
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString("hex");
  return req.session.csrf;
}

function verifyCsrf(req, res, next) {
  const sent = (req.body && req.body._csrf) || req.get("x-csrf-token");
  if (!req.session || !req.session.csrf || !sent || sent !== req.session.csrf) {
    return res.status(403).send("Your session expired or the form token was invalid. Go back and try again.");
  }
  next();
}

// Hidden input for forms.
function csrfField(req) {
  return `<input type="hidden" name="_csrf" value="${csrfToken(req)}">`;
}

module.exports = { csrfToken, verifyCsrf, csrfField };
