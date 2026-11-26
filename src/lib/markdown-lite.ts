// Small, safe Markdown renderer for stored match recaps. The input is
// AI-generated prose, so escape HTML first and only emit a known set of tags.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown: string): string {
  const blocks = String(markdown ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/);
  const out: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    if (/^###\s+/.test(block)) {
      out.push(`<h3>${inline(block.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(block)) {
      out.push(`<h2>${inline(block.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(block)) {
      // The page owns the H1; demote any article H1 to H2.
      out.push(`<h2>${inline(block.replace(/^#\s+/, ""))}</h2>`);
      continue;
    }

    const lines = block.split("\n");
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      out.push(
        `<ul>${lines
          .map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`,
      );
      continue;
    }
    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      out.push(
        `<ol>${lines
          .map((line) => `<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`)
          .join("")}</ol>`,
      );
      continue;
    }

    out.push(`<p>${inline(block).replace(/\n/g, "<br />")}</p>`);
  }

  return out.join("\n");
}
