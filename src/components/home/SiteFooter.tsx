import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { SPORT_LIST } from "@/lib/sports-config";
import { AdSlot } from "@/components/ads/AdSlot";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-12 bg-gradient-to-b from-transparent to-gray-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AdSlot slot="footer" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        {/* Brand row */}
        <div className="mb-6 pb-6 border-b border-border/60">
          <div className="inline-flex items-center gap-2 font-extrabold text-base">
            <Trophy className="size-4 text-amber-400" /> PlaySports
          </div>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xl">
            Live scores, standings, news and the complete FIFA World Cup archive — 1930 to 2026.
          </p>
        </div>

        {/* 3 columns side-by-side on every breakpoint */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          <FooterCol title="Sports" accent="from-amber-500/20 to-transparent">
            <li><Link to="/football" search={{ year: 2026 }} className="hover:text-amber-400 transition-colors">FIFA World Cup</Link></li>
            <li><Link to="/cricket" className="hover:text-emerald-400 transition-colors">Cricket</Link></li>
            {SPORT_LIST.map((s) => (
              <li key={s.slug}>
                <Link to={`/${s.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"} className="hover:text-foreground transition-colors">
                  <span className="mr-1">{s.emoji}</span>
                  <span className="hidden sm:inline">{s.longName}</span>
                  <span className="sm:hidden uppercase tracking-wide">{s.slug}</span>
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Explore" accent="from-indigo-500/20 to-transparent">
            <li><Link to="/players" className="hover:text-amber-400 transition-colors">Player Stats</Link></li>
            <li><Link to="/cricket/history" className="hover:text-emerald-400 transition-colors">Cricket History</Link></li>
            <li><Link to="/mlb/history" className="hover:text-sky-400 transition-colors">MLB History</Link></li>
            <li><Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link></li>
          </FooterCol>

          <FooterCol title="Data" accent="from-emerald-500/20 to-transparent" muted>
            <li>ESPN API</li>
            <li>FIFA · Sofascore</li>
            <li>jfjelstul/worldcup</li>
            <li>ESPNCricinfo</li>
          </FooterCol>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} PlaySports · Built with ❤️ for sports fans worldwide
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  accent,
  muted,
  children,
}: {
  title: string;
  accent: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative rounded-xl border border-border/60 bg-gradient-to-b ${accent} p-3 sm:p-4 min-w-0`}>
      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-bold text-gray-300 mb-2 sm:mb-3 truncate">
        {title}
      </div>
      <ul className={`space-y-1.5 text-[11px] sm:text-xs leading-snug ${muted ? "text-gray-500" : "text-gray-300"} break-words`}>
        {children}
      </ul>
    </div>
  );
}
