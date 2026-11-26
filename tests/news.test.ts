import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/markdown-lite";
import { formatNewsDate } from "@/lib/news-date";

describe("news article markdown", () => {
  it("renders headings, bold text and lists", () => {
    const html = markdownToHtml("## Match overview\n\n**Brazil** won.\n\n- First half\n- Second half");
    expect(html).toContain("<h2>Match overview</h2>");
    expect(html).toContain("<strong>Brazil</strong>");
    expect(html).toContain("<ul><li>First half</li><li>Second half</li></ul>");
  });

  it("escapes HTML from stored content", () => {
    const html = markdownToHtml('<script>alert("x")</script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formats dates with a stable UTC locale", () => {
    expect(formatNewsDate("2026-11-27T10:00:00Z")).toBe("27 Nov 2026");
    expect(formatNewsDate(null)).toBe("");
  });
});
