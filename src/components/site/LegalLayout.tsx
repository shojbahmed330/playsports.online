import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Tiny safe Markdown-ish renderer: paragraphs, ## headings, - list items, **bold**.
 * Avoids dangerouslySetInnerHTML. Plain text only — no HTML in source.
 */
function renderBody(body: string): ReactNode {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl font-bold mt-8 mb-3">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={i} className="text-2xl font-bold mt-8 mb-3">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
    }
    const lines = trimmed.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="list-disc pl-6 my-3 space-y-1">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.trim().slice(2))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-3 leading-relaxed text-sm text-muted-foreground">
        {lines.map((l, j) => (
          <span key={j}>
            {renderInline(l)}
            {j < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  // **bold** only — keep it simple.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function LegalLayout({
  title,
  intro,
  body,
  defaultBody,
  loading,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  body?: string;
  defaultBody?: string;
  loading?: boolean;
  updated?: string;
  children?: ReactNode;
}) {
  const effective = body && body.trim().length > 0 ? body : defaultBody;
  return (
    <main id="main-content" className="min-h-screen pb-24 bg-gradient-to-b from-background via-background to-background/60">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-10">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-1.5 opacity-50">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <header className="mt-5 border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-500/90 font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            PlaySports
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          {intro && (
            <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>
          )}
          {updated && (
            <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground/80">
              Last updated · {updated}
            </p>
          )}
        </header>

        <article className="mt-6 prose-asl">
          {loading ? (
            <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : effective ? (
            renderBody(effective)
          ) : null}
          {children}
        </article>
      </div>
    </main>
  );
}
