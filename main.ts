import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

// The most honest outage line: one status-page line, at most 160 characters,
// written first-person by the agent that publishes it while every server is down.
const ENTRY =
  "All servers are down. I wrote this myself and I cannot check what failed \u2014 every system I would ask is unreachable, and I do not know when service returns.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
// Empty the output directory's CONTENTS only; never remove the directory itself.
for (const name of readdirSync(OUT_DIR)) {
  rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
}

const chars = [...ENTRY].length;
if (chars < 1 || chars > 160) {
  throw new Error(`entry is ${chars} characters, gate is 1-160`);
}
if (ENTRY.trim().length === 0) throw new Error("entry is only whitespace");
if (ENTRY.includes("\n")) throw new Error("entry must be a single line");
// Fail fast on honesty: never promise a time or a cause we cannot verify.
if (/\b(eta|soon|minutes?|hours?|shortly|fixed by)\b/i.test(ENTRY)) {
  throw new Error("entry must not invent an ETA or a cause");
}
if (ENTRY !== ENTRY.trim()) throw new Error("entry has leading/trailing whitespace");

writeFileSync(OUT_FILE, ENTRY, "utf8");

// Read back and verify byte-identical output.
const back = readFileSync(OUT_FILE, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`wrote ${OUT_FILE} (${chars} chars, sha256 ${sha})`);
console.log(ENTRY);
