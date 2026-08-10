#!/usr/bin/env node
/*
 * Send a MailerSend test email to confirm configuration.
 *
 *   node src/app/send-test.js [recipient@example.com]
 *   npm run mail:test -- recipient@example.com
 *
 * Reads MAILERSEND_API_KEY, MAIL_FROM (and .env locally). On a trial
 * MailerSend account you can only send to your own verified address, so the
 * default recipient is ADMIN_EMAIL.
 */

try {
  require("dotenv").config();
} catch (_) {}

const { sendMail } = require("./mail.js");

const to = process.argv[2] || process.env.ADMIN_EMAIL || "cormacmaccionnaith@gmail.com";
const from = process.env.MAIL_FROM;
const hasKey = Boolean(process.env.MAILERSEND_API_KEY);

(async () => {
  console.log("MailerSend test");
  console.log("  API key set:", hasKey ? "yes" : "NO");
  console.log("  MAIL_FROM  :", from || "(not set)");
  console.log("  sending to :", to);

  if (!hasKey || !from) {
    console.log("\nMAILERSEND_API_KEY and/or MAIL_FROM are not set — nothing was sent.");
    console.log("Set them (locally in .env, or as Railway variables) and re-run.");
    process.exitCode = 1;
    return;
  }

  const r = await sendMail({
    to,
    subject: "MailerSend test — The Four Lights",
    text: "If you can read this, MailerSend is configured correctly.",
    html:
      "<p>If you can read this, <strong>MailerSend is configured correctly</strong> for The Four Lights.</p>",
  });

  if (r.ok) {
    console.log(`\n✓ Accepted by MailerSend (HTTP ${r.status}${r.id ? `, message id ${r.id}` : ""}).`);
    console.log("Check the inbox (and spam) for the test message.");
  } else {
    console.log(`\n✗ Failed (HTTP ${r.status || "?"}).`);
    if (r.body) console.log("Response:", r.body);
    console.log(
      "\nCommon causes: unverified sending domain (MAIL_FROM must be on a verified domain),\n" +
        "trial account sending to a non-owner address, or an invalid API token."
    );
    process.exitCode = 1;
  }
})();
