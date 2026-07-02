// @lovable.dev/vite-tanstack-config already includes tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro, etc. Do not add them manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// DEPLOY_TARGET switches the Nitro preset so the same repo builds cleanly on
// both Lovable (Cloudflare Workers) and Vercel.
const DEPLOY_TARGET = process.env.DEPLOY_TARGET ?? "cloudflare";
const isVercel = DEPLOY_TARGET === "vercel" || !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: isVercel
    ? {}
    : {
        server: { entry: "server" },
      },
  nitro: isVercel ? { preset: "vercel" } : undefined,
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        strategies: "generateSW",
        filename: "sw.js",
        manifest: false,
        devOptions: { enabled: false },
        workbox: {
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/_serverFn\//],
          globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff,woff2}"],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-nav",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && /\/assets\/.+\.(?:js|css|woff2?)$/.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/(site\.api\.espn\.com|sports\.core\.api\.espn\.com|.*\.rapidapi\.com)\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "sports-api",
                networkTimeoutSeconds: 6,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 5 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/a\.espncdn\.com\//,
              handler: "CacheFirst",
              options: {
                cacheName: "espn-cdn",
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
});
