import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

// Mojibake that appears when UTF-8 is decoded as a legacy Windows codepage.
// Any of these in source means a build step rewrote text with the wrong encoding.
const MOJIBAKE = /â€|ðŸ|Ã¢|Ã©|Â·|â€™|â€“|ï»¿|\uFFFD/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("source encoding", () => {
  it("contains no mojibake or replacement characters", () => {
    const files = walk(resolve(root, "src"));
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(MOJIBAKE.test(text), `${file} contains mojibake`).toBe(false);
    }
  });
});
