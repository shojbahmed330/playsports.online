const BASE_CSS = `
      :root { color-scheme: dark; }
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #07090c; color: #f5f7fa; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #9aa4b2; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 1rem; border-radius: 0.75rem; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      a:focus-visible, button:focus-visible { outline: 2px solid #f5f7fa; outline-offset: 2px; }
      .primary { background: #f5f7fa; color: #07090c; }
      .secondary { background: transparent; color: #f5f7fa; border-color: #2a3240; }
      .top { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 0.25rem; padding: 0 1rem; height: 56px; border-bottom: 1px solid #1b2130; background: rgba(7,9,12,0.9); }
      .brand { font-weight: 800; letter-spacing: -0.02em; margin-right: auto; color: #f5f7fa; text-decoration: none; }
      .brand span { color: #f0b429; }
      .top a.nav { color: #9aa4b2; font-size: 0.875rem; font-weight: 600; text-decoration: none; padding: 0 0.6rem; border-radius: 0.5rem; }
      .top a.nav:hover { color: #f5f7fa; }`;

const HEADER = `<header class="top">
      <a class="brand" href="/">Play<span>Sports</span></a>
      <a class="nav" href="/cricket">Cricket</a>
      <a class="nav" href="/football">Football</a>
      <a class="nav" href="/live/today">Live</a>
      <a class="nav" href="/news">News</a>
    </header>`;

/** Branded 404 used when a request matches no page route. */
export function renderNotFoundPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Page not found — PlaySports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="robots" content="noindex, follow" />
    <meta name="theme-color" content="#000000" />
    <meta name="color-scheme" content="dark" />
    <style>${BASE_CSS}</style>
  </head>
  <body>
    ${HEADER}
    <main class="card">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div class="actions">
        <a class="primary" href="/">Go home</a>
        <a class="secondary" href="/search">Search the site</a>
      </div>
      <p style="margin-top:1.5rem">
        <a href="/cricket" style="color:#9aa4b2">Cricket</a> ·
        <a href="/football" style="color:#9aa4b2">Football</a> ·
        <a href="/live/today" style="color:#9aa4b2">Live scores</a>
      </p>
    </main>
  </body>
</html>`;
}

export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load — PlaySports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#000000" />
    <meta name="color-scheme" content="dark" />
    <style>${BASE_CSS}</style>
  </head>
  <body>
    <main class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button type="button" class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </main>
  </body>
</html>`;
}
