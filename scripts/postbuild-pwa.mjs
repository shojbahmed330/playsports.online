// Copies the VitePWA service worker into Nitro's deploy output. VitePWA writes
// to dist/ after the client build, but Nitro has already snapshotted its public
// directory, so /sw.js would otherwise 404 in production.
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
if (!existsSync(dist)) {
  console.error("[pwa] dist/ not found; run vite build first");
  process.exit(0);
}

const files = readdirSync(dist).filter((f) => f === "sw.js" || /^workbox-.*\.js$/.test(f));
if (files.length === 0) {
  console.log("[pwa] no service worker files in dist/");
  process.exit(0);
}

const targets = [".output/public", ".vercel/output/static"];
let copied = 0;
for (const target of targets) {
  const dir = resolve(root, target);
  if (!existsSync(dir)) continue;
  for (const file of files) {
    copyFileSync(join(dist, file), join(dir, file));
    copied++;
  }
  console.log(`[pwa] copied ${files.length} file(s) to ${target}`);
}

if (copied === 0) console.log("[pwa] no deploy output directory found");
