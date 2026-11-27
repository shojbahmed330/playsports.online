import type { ReactNode } from "react";

/**
 * Shared visual primitives for the redesign.
 *
 * Rules:
 * - Semantic tokens only (`bg-card`, `text-muted-foreground`, `border-border`).
 * - No hardcoded palette utilities — the design-system test guards this.
 * - Interactive targets are 44 px (`min-h-11` / `size-11`).
 */

type CardElement = "div" | "section" | "article";

export function Card({
  as: Tag = "div",
  className = "",
  elevated = false,
  children,
}: {
  as?: CardElement;
  className?: string;
  elevated?: boolean;
  children: ReactNode;
}) {
  return (
    <Tag
      className={[
        "rounded-2xl border border-border bg-card/60",
        elevated ? "shadow-[var(--shadow-elevated)]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "neutral" | "live" | "positive" | "gold";
}) {
  const valueTone = {
    neutral: "text-foreground",
    live: "text-live",
    positive: "text-positive",
    gold: "text-gold",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-3 py-2.5">
      <div className="text-micro uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 text-h3 tabular-nums ${valueTone}`}>{value}</div>
      {hint && <div className="mt-0.5 text-caption text-muted-foreground">{hint}</div>}
    </div>
  );
}

export type ScoreStatus = "live" | "ft" | "upcoming";

const STATUS_LABEL: Record<ScoreStatus, string> = {
  live: "Live",
  ft: "Full time",
  upcoming: "Upcoming",
};

export function ScoreRow({
  home,
  away,
  homeScore,
  awayScore,
  status,
  meta,
}: {
  home: string;
  away: string;
  homeScore?: number | string;
  awayScore?: number | string;
  status: ScoreStatus;
  meta?: string;
}) {
  const live = status === "live";
  return (
    <li className="flex min-h-11 items-center gap-3 border-b border-border/60 px-3 py-2 last:border-b-0">
      <span
        className={[
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-micro uppercase",
          live
            ? "bg-live/15 text-live ring-1 ring-live/30"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {live && (
          <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        )}
        {STATUS_LABEL[status]}
      </span>
      <span className="min-w-0 flex-1 truncate text-body">
        <span className="text-foreground">{home}</span>
        <span className="mx-1.5 text-muted-foreground" aria-hidden="true">
          v
        </span>
        <span className="text-foreground">{away}</span>
        {meta && <span className="ml-2 text-caption text-muted-foreground">{meta}</span>}
      </span>
      <span className="shrink-0 text-body font-bold tabular-nums text-foreground">
        {homeScore ?? "–"}<span className="mx-0.5 text-muted-foreground">-</span>{awayScore ?? "–"}
      </span>
    </li>
  );
}

export function TableShell({
  caption,
  columns,
  children,
  className = "",
}: {
  caption: string;
  columns: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-border bg-card/40 ${className}`}>
      <table className="w-full text-body">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/50 text-micro uppercase text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 text-left font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Hero({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-hero)] px-4 py-8 sm:px-8 sm:py-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative max-w-3xl">
        {kicker && <p className="text-micro uppercase text-primary">{kicker}</p>}
        <h1 className="mt-1 text-h1 text-foreground sm:text-display">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-body text-muted-foreground">{description}</p>
        )}
        {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
