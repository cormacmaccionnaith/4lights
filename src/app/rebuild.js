/*
 * Static-site rebuild, coalesced.
 *
 * Inline editing saves a field at a time, so rebuilds can arrive in bursts.
 * Only one build runs at a time; requests arriving during a build are folded
 * into a single follow-up run.
 */

const path = require("path");
const { spawn } = require("child_process");

const APP_ROOT = path.resolve(__dirname, "../..");

let running = null; // Promise of the in-flight build
let pending = false; // another build was requested while one was running

function runBuild() {
  return new Promise((resolve) => {
    const cp = spawn("node", ["src/build.js"], { cwd: APP_ROOT, env: process.env });
    let err = "";
    cp.stderr.on("data", (d) => (err += d));
    cp.on("exit", (code) => resolve({ code, err: err.trim() }));
    cp.on("error", (e) => resolve({ code: 1, err: e.message }));
  });
}

async function rebuild() {
  if (running) {
    pending = true;
    return running;
  }
  running = (async () => {
    let result = await runBuild();
    while (pending) {
      pending = false;
      result = await runBuild();
    }
    return result;
  })();
  try {
    return await running;
  } finally {
    running = null;
  }
}

module.exports = { rebuild };
