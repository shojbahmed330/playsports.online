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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="inline-flex items-center gap-2 font-extrabold text-base">
            <Trophy className="size-4 text-amber-400" /> Sports Hub
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            Live scores, standings, news and the complete FIFA World Cup archive — 1930 to 2026.
          </p>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-3">Sports</div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            <li><Link to="/football" search={{ year: 2026 }} className="hover:text-amber-400">FIFA World Cup</Link></li>
            <li><Link to="/cricket" className="hover:text-emerald-400">Cricket</Link></li>
            {SPORT_LIST.map((s) => (
              <li key={s.slug}>
                <Link to={`/${s.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"} className={`hover:${s.accent}`}>
                  {s.emoji} {s.longName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-3">Explore</div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            <li><Link to="/players" className="hover:text-amber-400">Player Stats</Link></li>
            <li><Link to="/cricket/history" className="hover:text-emerald-400">Cricket History</Link></li>
            <li><Link to="/mlb/history" className="hover:text-sky-400">MLB History</Link></li>
            <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-3">Data sources</div>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>ESPN public API</li>
            <li>FIFA / Sofascore</li>
            <li>jfjelstul/worldcup</li>
            <li>ESPNCricinfo</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Sports Hub · Built with ❤️ for sports fans worldwide
      </div>
    </footer>
  );
}
