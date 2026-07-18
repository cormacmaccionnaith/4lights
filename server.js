#!/usr/bin/env node
/*
 * The Four Lights — minimal static file server (zero dependencies).
 *
 * Serves the generated static site (HTML at the project root + /assets)
 * on the port Railway provides via $PORT, bound to 0.0.0.0 so the
 * platform can route to it. Node stdlib only.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Only GET/HEAD for a static site.
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad Request");
  }

  if (pathname === "/") pathname = "/index.html";

  // Resolve within ROOT and refuse traversal or dotfiles (e.g. /.git).
  const rel = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT + path.sep) || rel.split(/[/\\]/).some((s) => s.startsWith("."))) {
    return send(res, 403, "Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Fall back to the styled 404 if present, else plain text.
      const notFound = path.join(ROOT, "404.html");
      if (fs.existsSync(notFound)) {
        return send(res, 404, fs.readFileSync(notFound), { "Content-Type": TYPES[".html"] });
      }
      return send(res, 404, "Not Found", { "Content-Type": TYPES[".txt"] });
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    // Cache fingerprint-free assets briefly; never cache HTML hard.
    const cache = ext === ".html" ? "no-cache" : "public, max-age=3600";
    const headers = { "Content-Type": type, "Cache-Control": cache, "X-Content-Type-Options": "nosniff" };

    if (req.method === "HEAD") return send(res, 200, null, headers);
    fs.createReadStream(filePath)
      .on("error", () => send(res, 500, "Internal Server Error"))
      .pipe(res.writeHead(200, headers));
  });
});

server.listen(PORT, HOST, () => {
  console.log(`The Four Lights served on http://${HOST}:${PORT}`);
});
