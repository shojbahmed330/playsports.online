// Guarded PWA service-worker registration wrapper.
//
// Follows the Lovable PWA skill:
//   - Registers ONLY in production, top-level windows.
//   - Refuses in dev, iframes, Lovable preview hosts, and when ?sw=off is set.
//   - In any refused context, actively unregisters any existing /sw.js
//     registration so a stale worker cannot serve old HTML.
//
// This is the ONLY place that registers the app-shell SW. Never call
// navigator.serviceWorker.register elsewhere.

const APP_SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!("serviceWorker" in navigator)) return true;
  // Dev build guard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env;
  if (env && env.PROD !== true) return true;
  // Iframe guard (Lovable preview embeds the app in an iframe)
  try {
    if (window.self !== window.top) return true;
  } catch {
    // cross-origin frame access throws — treat as refused
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;
  return false;
}

async function unregisterAppSw() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(APP_SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* ignore */
  }
}

export function registerPwa() {
  if (typeof window === "undefined") return;
  if (isRefusedContext()) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void unregisterAppSw();
    }
    return;
  }
  // Lazy-load the plugin's registration virtual module only in a real production window.
  void import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {
      /* plugin missing at build time is not fatal */
    });
}
