/*
 * MailerSend transactional email via their REST API (global fetch, no SDK).
 *
 * Configuration (env):
 *   MAILERSEND_API_KEY   API token. If absent, emails are logged to the
 *                        console instead of sent (dev works with no setup).
 *   MAIL_FROM            verified sender address, e.g. no-reply@swimthe4lights.org
 *   MAIL_FROM_NAME       optional display name (default "The Four Lights")
 *   ADMIN_EMAIL          where admin notifications go
 *   APP_URL              public base URL for links in emails
 */

const APP_URL = (process.env.APP_URL || "https://swimthe4lights.org").replace(/\/$/, "");
const FROM_NAME = process.env.MAIL_FROM_NAME || "The Four Lights";
const ENDPOINT = "https://api.mailersend.com/v1/email";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(heading, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#08111c;font-family:Helvetica,Arial,sans-serif;color:#e6e1d5">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="letter-spacing:.28em;text-transform:uppercase;font-size:12px;color:#e2ac5b;font-weight:bold">The Four Lights</div>
    <h1 style="font-size:22px;color:#f2efe7;margin:16px 0 8px">${esc(heading)}</h1>
    <div style="font-size:15px;line-height:1.6;color:#cfc9bb">${bodyHtml}</div>
    <p style="margin-top:32px;font-size:12px;color:#6b7d90">Na Ceithre Soilse · The Four Lights Swim Series</p>
  </div></body></html>`;
}

function button(href, label) {
  return `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#e2ac5b;color:#08111c;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:3px;display:inline-block">${esc(label)}</a></p>
  <p style="font-size:13px;color:#6b7d90;word-break:break-all">Or paste this link: ${esc(href)}</p>`;
}

async function sendMail({ to, toName, subject, html, text }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[mail:disabled] to=${to} subject="${subject}"\n${text || "(html only)"}`);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        from: { email: from, name: FROM_NAME },
        to: [{ email: to, name: toName || to }],
        subject,
        html,
        text: text || subject,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[mail] MailerSend ${res.status}: ${body}`);
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[mail] send failed:", err.message);
    return { ok: false, error: err.message };
  }
}

// ---- typed messages -------------------------------------------------------

function sendVerify(user, token) {
  const href = `${APP_URL}/verify?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    toName: user.full_name,
    subject: "Confirm your email — The Four Lights",
    text: `Welcome to The Four Lights. Confirm your email: ${href}`,
    html: shell(
      "Confirm your email",
      `<p>Welcome to The Four Lights. Confirm your email address to activate your account.</p>${button(
        href,
        "Confirm email"
      )}<p>If you didn't create an account, you can ignore this message.</p>`
    ),
  });
}

function sendReset(user, token) {
  const href = `${APP_URL}/reset?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: user.email,
    toName: user.full_name,
    subject: "Reset your password — The Four Lights",
    text: `Reset your password: ${href} (valid for one hour)`,
    html: shell(
      "Reset your password",
      `<p>We received a request to reset your password. This link is valid for one hour.</p>${button(
        href,
        "Reset password"
      )}<p>If you didn't request this, you can ignore this message.</p>`
    ),
  });
}

function sendAccreditationSubmitted(admin, swimmer, swimName) {
  const href = `${APP_URL}/admin`;
  return sendMail({
    to: admin,
    subject: `New accreditation submitted — ${swimName}`,
    text: `${swimmer.full_name || swimmer.email} submitted accreditation for ${swimName}. Review: ${href}`,
    html: shell(
      "New accreditation to review",
      `<p><strong>${esc(swimmer.full_name || swimmer.email)}</strong> submitted accreditation documents for <strong>${esc(
        swimName
      )}</strong>.</p>${button(href, "Open admin dashboard")}`
    ),
  });
}

function sendAccreditationDecision(user, swimName, accredited) {
  const href = `${APP_URL}/account`;
  return sendMail({
    to: user.email,
    toName: user.full_name,
    subject: accredited ? `Accredited — ${swimName}` : `Accreditation update — ${swimName}`,
    text: accredited
      ? `Your ${swimName} crossing has been accredited. ${href}`
      : `Your ${swimName} accreditation needs another look. ${href}`,
    html: shell(
      accredited ? "Crossing accredited" : "Accreditation update",
      accredited
        ? `<p>Your <strong>${esc(swimName)}</strong> crossing has been reviewed and <strong>accredited</strong>. One light closer.</p>${button(
            href,
            "View your account"
          )}`
        : `<p>Your <strong>${esc(swimName)}</strong> accreditation needs another look — please check your account for details.</p>${button(
            href,
            "View your account"
          )}`
    ),
  });
}

function sendSeriesCompleted(user) {
  const href = `${APP_URL}/account`;
  return sendMail({
    to: user.email,
    toName: user.full_name,
    subject: "You hold the Four Lights",
    text: `All four crossings accredited. You hold the Four Lights. ${href}`,
    html: shell(
      "You hold the Four Lights",
      `<p>All four crossings are accredited. You have completed the series and now hold the Four Lights. It is a rare thing — well done.</p>${button(
        href,
        "View your account"
      )}`
    ),
  });
}

module.exports = {
  APP_URL,
  sendMail,
  sendVerify,
  sendReset,
  sendAccreditationSubmitted,
  sendAccreditationDecision,
  sendSeriesCompleted,
};
