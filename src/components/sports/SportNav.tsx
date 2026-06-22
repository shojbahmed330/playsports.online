import { Link } from "@tanstack/react-router";
import { Trophy, ShieldCheck } from "lucide-react";
import { SPORT_LIST } from "@/lib/sports-config";
import { useAuth } from "@/hooks/use-auth";

export function SportNav({ liveCount = 0 }: { liveCount?: number }) {
  const { isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 grid place-items-center ring-1 ring-amber-500/40">
            <Trophy className="size-5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">Sports Hub</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400">Live · Stats · Archive</div>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 text-sm overflow-x-auto">
          <NavTab to="/football" emoji="⚽" label="Football" />
          {SPORT_LIST.map((s) => (
            <NavTab key={s.slug} to={`/${s.slug}`} emoji={s.emoji} label={s.label} />
          ))}
          {liveCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {liveCount} live
            </span>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="ml-2 px-3 py-1.5 rounded-md text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5" /> Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavTab({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <a
      href={to}
      className="shrink-0 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center gap-1.5"
    >
      <span aria-hidden>{emoji}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
