import type { CachedRecap } from "@/lib/match-recaps.server";

interface Props {
  recap: CachedRecap;
}

/** Very small Markdown → HTML renderer for AI-generated recaps.
 * Supports H2/H3, bold, italic, inline links and paragraph breaks. */
function renderMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flush();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flush();
      out.push(`<h2>${inline(line.slice(2))}</h2>`);
    } else {
      para.push(line);
    }
  }
  flush();
  return out.join("\n");
}

export function MatchRecapArticle({ recap }: Props) {
  const html = renderMarkdown(recap.full_article);
  return (
    <section className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-7">
      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold">
        <span className="inline-block size-1.5 rounded-full bg-gold" /> AI Match Recap
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-2">
        {recap.headline}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">{recap.summary}</p>

      {recap.key_moments.length > 0 && (
        <ol className="mb-6 space-y-2 border-l-2 border-gold/40 pl-4">
          {recap.key_moments.map((m, i) => (
            <li key={i} className="text-sm">
              <div className="font-semibold">
                {m.minute && <span className="text-gold mr-2">{m.minute}</span>}
                {m.title}
              </div>
              <div className="text-muted-foreground">{m.detail}</div>
            </li>
          ))}
        </ol>
      )}

      <div
        className="prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:font-bold prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-2 prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="mt-6 text-[10px] uppercase tracking-wider text-muted-foreground">
        Recap last updated {new Date(recap.updated_at).toLocaleDateString()}
      </p>
    </section>
  );
}
