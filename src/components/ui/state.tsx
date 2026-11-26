import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";

const card = "rounded-2xl border border-border bg-card/40 px-6 py-10 text-center";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${card} ${className}`} aria-live="polite">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-white/[0.04] text-muted-foreground ring-1 ring-border">
        {icon ?? <Inbox className="size-5" aria-hidden="true" />}
      </div>
      <h2 className="mt-3 text-base font-bold text-foreground">{title}</h2>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>
      )}
    </section>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this page. Check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
  className = "",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <section className={`${card} ${className}`} role="alert">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-destructive/15 text-destructive ring-1 ring-destructive/30">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-base font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </section>
  );
}

export function LoadingState({
  label = "Loading…",
  rows = 3,
  className = "",
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: Math.max(rows, 1) }).map((_, i) => (
        <div
          key={i}
          className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card/30 px-4 py-3"
        >
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  className = "",
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        {kicker && (
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Small inline spinner for buttons and compact rows. */
export function InlineSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
