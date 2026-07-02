// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// DEPLOY_TARGET switches the Nitro preset so the same repo builds cleanly on
// both Lovable (Cloudflare Workers) and Vercel.
//   - unset / "cloudflare"  → Lovable default (uses our src/server.ts wrapper)
//   - "vercel"              → Vercel serverless (Nitro's built-in entry)
const DEPLOY_TARGET = process.env.DEPLOY_TARGET ?? "cloudflare";
const isVercel = DEPLOY_TARGET === "vercel" || !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: isVercel
    ? {}
    : {
        // Cloudflare only — routes SSR through src/server.ts (our error wrapper).
        server: { entry: "server" },
      },
  nitro: isVercel
    ? { preset: "vercel" }
    : undefined,
});
